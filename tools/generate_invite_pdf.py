#!/usr/bin/env python3
"""
Generate a PDF wedding invitation matching the website style.
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os
import math

# Color palette matching the website
EGGPLANT = HexColor('#6B1F57')
PLUM = HexColor('#9B7FA7')
LILAC = HexColor('#D4B5E0')
LILAC_LIGHT = HexColor('#E8D9F0')
IVORY = HexColor('#FFFFF0')
IVORY_WARM = HexColor('#F9F6F0')
TEXT_DARK = HexColor('#2C2C2C')
TEXT_MEDIUM = HexColor('#5A5A5A')

def draw_floral_decoration(c, x, y, size=0.3):
    """Draw a simple floral decoration"""
    c.setStrokeColor(PLUM)
    c.setFillColor(PLUM)
    c.setLineWidth(1)
    
    # Draw a simple flower shape
    center_x, center_y = x, y
    petal_size = size * inch
    
    # Draw petals
    for i in range(5):
        angle = i * 72  # 360/5 = 72 degrees
        rad = math.radians(angle)
        petal_x = center_x + petal_size * math.cos(rad)
        petal_y = center_y + petal_size * math.sin(rad)
        c.circle(petal_x, petal_y, petal_size * 0.3, fill=1)
    
    # Draw center
    c.setFillColor(EGGPLANT)
    c.circle(center_x, center_y, petal_size * 0.2, fill=1)

def create_wedding_invite_pdf(output_filename='wedding_invite.pdf'):
    """Create a PDF wedding invitation matching the website style"""
    
    # Use A4 size (similar to letter but more common in Europe)
    width, height = A4
    
    c = canvas.Canvas(output_filename, pagesize=A4)
    c.setTitle("Semih Kicara & Satya Fitz - Hochzeitseinladung")
    
    # Background - ivory gradient effect
    c.setFillColor(IVORY)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Add subtle border with double line effect
    margin = 0.6 * inch
    c.setStrokeColor(LILAC_LIGHT)
    c.setLineWidth(1.5)
    c.rect(margin, margin, width - 2*margin, height - 2*margin, fill=0, stroke=1)
    
    # Inner border
    inner_margin = 0.1 * inch
    c.setStrokeColor(LILAC)
    c.setLineWidth(1)
    c.rect(margin + inner_margin, margin + inner_margin, 
           width - 2*(margin + inner_margin), height - 2*(margin + inner_margin), 
           fill=0, stroke=1)
    
    # Floral decorations at corners (smaller, more subtle)
    draw_floral_decoration(c, margin + 0.4*inch, height - margin - 0.4*inch, 0.2)
    draw_floral_decoration(c, width - margin - 0.4*inch, height - margin - 0.4*inch, 0.2)
    draw_floral_decoration(c, margin + 0.4*inch, margin + 0.4*inch, 0.2)
    draw_floral_decoration(c, width - margin - 0.4*inch, margin + 0.4*inch, 0.2)
    
    # Main content area - start from top
    content_y = height - 2.5 * inch
    
    # Greeting text (in German, matching website) - italic, elegant
    c.setFillColor(EGGPLANT)
    c.setFont("Helvetica-Oblique", 20)
    greeting = "Wir laden euch herzlich zu unserer Hochzeit ein"
    text_width = c.stringWidth(greeting, "Helvetica-Oblique", 20)
    c.drawString((width - text_width) / 2, content_y, greeting)
    
    content_y -= 0.7 * inch
    
    # Dates - in plum color
    c.setFillColor(PLUM)
    c.setFont("Helvetica", 17)
    dates = "20.06.2026 & 25.07.2026"
    text_width = c.stringWidth(dates, "Helvetica", 17)
    c.drawString((width - text_width) / 2, content_y, dates)
    
    content_y -= 1 * inch
    
    # Names - larger, more prominent, elegant script-like style
    c.setFillColor(EGGPLANT)
    c.setFont("Helvetica-BoldOblique", 42)
    names = "Semih Kicara & Satya Fitz"
    text_width = c.stringWidth(names, "Helvetica-BoldOblique", 42)
    c.drawString((width - text_width) / 2, content_y, names)
    
    content_y -= 1.5 * inch
    
    # Decorative line with floral elements
    line_y = content_y
    line_margin = 1.8 * inch
    c.setStrokeColor(LILAC)
    c.setLineWidth(1.5)
    c.line(line_margin, line_y, width - line_margin, line_y)
    
    # Add small decorative elements on the line
    for i in range(3):
        x_pos = line_margin + (width - 2*line_margin) * (i + 1) / 4
        draw_floral_decoration(c, x_pos, line_y, 0.12)
    
    content_y -= 1.2 * inch
    
    # Location details - Germany
    c.setFillColor(EGGPLANT)
    c.setFont("Helvetica-BoldOblique", 22)
    location1_title = "Deutschland"
    text_width = c.stringWidth(location1_title, "Helvetica-BoldOblique", 22)
    c.drawString((width - text_width) / 2, content_y, location1_title)
    
    content_y -= 0.5 * inch
    
    c.setFillColor(PLUM)
    c.setFont("Helvetica", 15)
    location1_date = "20. Juni 2026"
    text_width = c.stringWidth(location1_date, "Helvetica", 15)
    c.drawString((width - text_width) / 2, content_y, location1_date)
    
    content_y -= 0.35 * inch
    
    c.setFillColor(TEXT_MEDIUM)
    c.setFont("Helvetica-Oblique", 13)
    location1_place = "Siedelsbrunn"
    text_width = c.stringWidth(location1_place, "Helvetica-Oblique", 13)
    c.drawString((width - text_width) / 2, content_y, location1_place)
    
    content_y -= 0.9 * inch
    
    # Location details - Bosnia
    c.setFillColor(EGGPLANT)
    c.setFont("Helvetica-BoldOblique", 22)
    location2_title = "Bosnien & Herzegowina"
    text_width = c.stringWidth(location2_title, "Helvetica-BoldOblique", 22)
    c.drawString((width - text_width) / 2, content_y, location2_title)
    
    content_y -= 0.5 * inch
    
    c.setFillColor(PLUM)
    c.setFont("Helvetica", 15)
    location2_date = "25. Juli 2026"
    text_width = c.stringWidth(location2_date, "Helvetica", 15)
    c.drawString((width - text_width) / 2, content_y, location2_date)
    
    content_y -= 0.35 * inch
    
    c.setFillColor(TEXT_MEDIUM)
    c.setFont("Helvetica-Oblique", 13)
    location2_place = "Sarajevo"
    text_width = c.stringWidth(location2_place, "Helvetica-Oblique", 13)
    c.drawString((width - text_width) / 2, content_y, location2_place)
    
    content_y -= 0.9 * inch
    
    # RSVP note
    c.setFillColor(TEXT_MEDIUM)
    c.setFont("Helvetica", 11)
    rsvp_text = "Bitte gebt uns über unsere Website Bescheid, ob ihr dabei seid."
    text_width = c.stringWidth(rsvp_text, "Helvetica", 11)
    c.drawString((width - text_width) / 2, content_y, rsvp_text)
    
    # Footer with heart emoji (will show as text)
    footer_y = margin + 0.4 * inch
    c.setFillColor(TEXT_MEDIUM)
    c.setFont("Helvetica-Oblique", 11)
    footer_text = "Wir können es kaum erwarten, mit euch zu feiern!"
    text_width = c.stringWidth(footer_text, "Helvetica-Oblique", 11)
    c.drawString((width - text_width) / 2, footer_y, footer_text)
    
    c.save()
    print(f"PDF wedding invitation created: {output_filename}")

if __name__ == "__main__":
    create_wedding_invite_pdf()
