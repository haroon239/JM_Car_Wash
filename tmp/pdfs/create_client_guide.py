from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    Image,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics


ROOT = Path(r"C:\Users\Haroon\Desktop\JM car wash")
OUTPUT = ROOT / "output" / "pdf" / "JM_Car_Wash_Billing_Manager_Client_Guide.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

SCREENSHOTS = {
    "customers": Path(
        r"C:\Users\Haroon\AppData\Local\Temp\codex-clipboard-5fee541f-6495-4f1d-8adb-a7f08ca4032b.png"
    ),
    "invoice": Path(
        r"C:\Users\Haroon\AppData\Local\Temp\codex-clipboard-184d5125-0618-41c6-9634-0d45256528fe.png"
    ),
    "invoices": Path(
        r"C:\Users\Haroon\AppData\Local\Temp\codex-clipboard-b8155c80-8521-4e57-8de5-ddbe4ef9d5dd.png"
    ),
    "profile": Path(
        r"C:\Users\Haroon\AppData\Local\Temp\codex-clipboard-595d3cdc-24e4-4d9b-97dc-31e8b0341a87.png"
    ),
    "dashboard": Path(
        r"C:\Users\Haroon\AppData\Local\Temp\codex-clipboard-1127b679-ad57-496f-8492-4e32196ec7d5.png"
    ),
}

TEAL = colors.HexColor("#087F78")
TEAL_DARK = colors.HexColor("#12323A")
TEAL_PALE = colors.HexColor("#E7F6F3")
INK = colors.HexColor("#172C37")
MUTED = colors.HexColor("#647780")
LINE = colors.HexColor("#DCE7E9")
WASH = colors.HexColor("#F4F8F8")
GREEN = colors.HexColor("#11815F")
AMBER = colors.HexColor("#D58A1F")
RED = colors.HexColor("#C74444")

font_path = Path(r"C:\Windows\Fonts\arial.ttf")
font_bold_path = Path(r"C:\Windows\Fonts\arialbd.ttf")
if font_path.exists() and font_bold_path.exists():
    pdfmetrics.registerFont(TTFont("ClientSans", str(font_path)))
    pdfmetrics.registerFont(TTFont("ClientSans-Bold", str(font_bold_path)))
    FONT = "ClientSans"
    FONT_BOLD = "ClientSans-Bold"
else:
    FONT = "Helvetica"
    FONT_BOLD = "Helvetica-Bold"


class SectionLabel(Flowable):
    def __init__(self, number, label):
        super().__init__()
        self.number = str(number)
        self.label = label.upper()
        self.width = 170 * mm
        self.height = 9 * mm

    def draw(self):
        self.canv.setFillColor(TEAL)
        self.canv.roundRect(0, 0, 8 * mm, 8 * mm, 2 * mm, fill=1, stroke=0)
        self.canv.setFillColor(colors.white)
        self.canv.setFont(FONT_BOLD, 9)
        self.canv.drawCentredString(4 * mm, 2.4 * mm, self.number)
        self.canv.setFillColor(TEAL)
        self.canv.setFont(FONT_BOLD, 8)
        self.canv.drawString(11 * mm, 2.7 * mm, self.label)


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="CoverTitle",
        fontName=FONT_BOLD,
        fontSize=28,
        leading=33,
        textColor=colors.white,
        alignment=TA_LEFT,
        spaceAfter=8 * mm,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverSub",
        fontName=FONT,
        fontSize=12,
        leading=18,
        textColor=colors.HexColor("#D4E7E7"),
    )
)
styles.add(
    ParagraphStyle(
        name="H1x",
        fontName=FONT_BOLD,
        fontSize=21,
        leading=25,
        textColor=INK,
        spaceAfter=4 * mm,
    )
)
styles.add(
    ParagraphStyle(
        name="H2x",
        fontName=FONT_BOLD,
        fontSize=13,
        leading=16,
        textColor=INK,
        spaceBefore=3 * mm,
        spaceAfter=2 * mm,
    )
)
styles.add(
    ParagraphStyle(
        name="Bodyx",
        fontName=FONT,
        fontSize=9.3,
        leading=14,
        textColor=INK,
        spaceAfter=2.5 * mm,
    )
)
styles.add(
    ParagraphStyle(
        name="Smallx",
        fontName=FONT,
        fontSize=7.5,
        leading=10,
        textColor=MUTED,
    )
)
styles.add(
    ParagraphStyle(
        name="Bulletx",
        fontName=FONT,
        fontSize=9,
        leading=13,
        textColor=INK,
        leftIndent=5 * mm,
        firstLineIndent=-3 * mm,
        bulletIndent=0,
        spaceAfter=1.5 * mm,
    )
)
styles.add(
    ParagraphStyle(
        name="Calloutx",
        fontName=FONT_BOLD,
        fontSize=9,
        leading=13,
        textColor=TEAL_DARK,
    )
)
styles.add(
    ParagraphStyle(
        name="TableHeadx",
        fontName=FONT_BOLD,
        fontSize=8,
        leading=10,
        textColor=colors.white,
    )
)
styles.add(
    ParagraphStyle(
        name="TableBodyx",
        fontName=FONT,
        fontSize=7.7,
        leading=10,
        textColor=INK,
    )
)


def P(text, style="Bodyx"):
    return Paragraph(text, styles[style])


def bullets(items):
    return [P(f"- {item}", "Bulletx") for item in items]


def screenshot(key, width=170 * mm):
    path = SCREENSHOTS[key]
    if not path.exists():
        return P(f"Screenshot unavailable: {key}", "Smallx")
    image = Image(str(path))
    ratio = image.imageHeight / image.imageWidth
    image.drawWidth = width
    image.drawHeight = width * ratio
    return Table(
        [[image]],
        colWidths=[width + 2 * mm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 1 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 1 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 1 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1 * mm),
            ]
        ),
    )


def info_box(title, text, color=TEAL_PALE):
    return Table(
        [[P(title, "Calloutx")], [P(text, "Bodyx")]],
        colWidths=[170 * mm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), color),
                ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
                ("TOPPADDING", (0, 0), (-1, 0), 4 * mm),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 3 * mm),
            ]
        ),
    )


def feature_table(rows, widths=(40 * mm, 130 * mm)):
    data = [[P("FEATURE", "TableHeadx"), P("HOW IT WORKS", "TableHeadx")]]
    data += [[P(a, "TableBodyx"), P(b, "TableBodyx")] for a, b in rows]
    return Table(
        data,
        colWidths=list(widths),
        repeatRows=1,
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), TEAL_DARK),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, WASH]),
                ("GRID", (0, 0), (-1, -1), 0.5, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2.7 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.7 * mm),
            ]
        ),
    )


def numbered_steps(items):
    rows = []
    for number, (title, text) in enumerate(items, start=1):
        badge = Table(
            [[P(str(number), "Calloutx")]],
            colWidths=[9 * mm],
            rowHeights=[9 * mm],
            style=TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), TEAL_PALE),
                    ("BOX", (0, 0), (-1, -1), 0.6, TEAL),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            ),
        )
        rows.append(
            [
                badge,
                [P(title, "H2x"), P(text, "Bodyx")],
            ]
        )
    return Table(
        rows,
        colWidths=[13 * mm, 157 * mm],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
            ]
        ),
    )


def header_footer(canvas, doc):
    if doc.page == 1:
        return
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(20 * mm, 284 * mm, 190 * mm, 284 * mm)
    canvas.setFont(FONT_BOLD, 8)
    canvas.setFillColor(TEAL_DARK)
    canvas.drawString(20 * mm, 288 * mm, "JM CAR WASH - BILLING MANAGER")
    canvas.setFont(FONT, 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 10 * mm, "Client workflow guide | Prepared 28 July 2026")
    canvas.drawRightString(190 * mm, 10 * mm, f"Page {doc.page}")
    canvas.restoreState()


def cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(TEAL_DARK)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setFillColor(TEAL)
    canvas.circle(174 * mm, 260 * mm, 48 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#17B5A8"))
    canvas.roundRect(22 * mm, 232 * mm, 24 * mm, 24 * mm, 5 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont(FONT_BOLD, 16)
    canvas.drawCentredString(34 * mm, 240 * mm, "JM")
    canvas.setFont(FONT_BOLD, 11)
    canvas.drawString(52 * mm, 243 * mm, "JAHAN MUHAMMAD FOR")
    canvas.drawString(52 * mm, 237 * mm, "CAR WASHING & CLEANING CO.")
    canvas.setFillColor(colors.HexColor("#6CE1D6"))
    canvas.rect(22 * mm, 214 * mm, 32 * mm, 1.5 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont(FONT_BOLD, 28)
    canvas.drawString(22 * mm, 179 * mm, "Billing Manager")
    canvas.setFont(FONT_BOLD, 28)
    canvas.drawString(22 * mm, 165 * mm, "Client Workflow Guide")
    canvas.setFont(FONT, 12)
    canvas.setFillColor(colors.HexColor("#D4E7E7"))
    canvas.drawString(22 * mm, 148 * mm, "Customer subscriptions, recurring invoices,")
    canvas.drawString(22 * mm, 140 * mm, "payments, PDF sharing and billing alerts.")
    canvas.setFillColor(colors.HexColor("#173B43"))
    canvas.roundRect(22 * mm, 84 * mm, 166 * mm, 34 * mm, 4 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont(FONT_BOLD, 9)
    canvas.drawString(29 * mm, 105 * mm, "LIVE SOFTWARE")
    canvas.setFont(FONT, 9)
    canvas.setFillColor(colors.HexColor("#B8CCCF"))
    canvas.drawString(29 * mm, 96 * mm, "jm-car-wash-app-production.up.railway.app")
    canvas.drawString(29 * mm, 89 * mm, "Prepared for client review and employee training")
    canvas.setFont(FONT, 8)
    canvas.setFillColor(colors.HexColor("#8FACB0"))
    canvas.drawString(22 * mm, 22 * mm, "Version 1.0 | 28 July 2026")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    rightMargin=20 * mm,
    leftMargin=20 * mm,
    topMargin=20 * mm,
    bottomMargin=17 * mm,
    title="JM Car Wash Billing Manager - Client Workflow Guide",
    author="JM Car Wash",
    subject="Software workflow and operating guide",
)

cover_frame = Frame(0, 0, A4[0], A4[1], id="cover", leftPadding=0, rightPadding=0)
body_frame = Frame(
    20 * mm,
    17 * mm,
    170 * mm,
    267 * mm,
    id="body",
    leftPadding=0,
    rightPadding=0,
    topPadding=5 * mm,
    bottomPadding=0,
)
doc.addPageTemplates(
    [
        PageTemplate(id="Cover", frames=[cover_frame], onPage=cover),
        PageTemplate(id="Body", frames=[body_frame], onPage=header_footer),
    ]
)

story = [Spacer(1, 280 * mm), NextPageTemplate("Body"), PageBreak()]

story += [
    SectionLabel(1, "Purpose and business value"),
    P("What this software does", "H1x"),
    P(
        "JM Car Wash Billing Manager keeps customer, vehicle, plan, invoice and payment information in one place. "
        "It is designed for a car washing company managing hundreds of recurring customers without calling or "
        "messaging every customer individually to calculate payment details.",
        "Bodyx",
    ),
    info_box(
        "The main result",
        "An employee enters a customer once. The software then tracks the agreed price and billing cycle, "
        "creates recurring invoices, highlights action required, generates a professional PDF and records payments.",
    ),
    Spacer(1, 4 * mm),
    P("End-to-end workflow", "H2x"),
    numbered_steps(
        [
            ("Add the customer", "Enter contact, vehicle, plan, agreed price and billing schedule."),
            ("Track the subscription", "The system calculates the next billing date and shows expiry alerts."),
            ("Generate the invoice", "Automatic billing creates due invoices; an employee can also generate one manually."),
            ("Review and share", "Open the invoice, confirm the amount and share its PDF through WhatsApp."),
            ("Record the result", "Mark it sent, paid or unsent; payment history and customer profile update."),
        ]
    ),
    Spacer(1, 3 * mm),
    feature_table(
        [
            ("Single source of truth", "Customer and billing records are stored in PostgreSQL."),
            ("Customer-specific pricing", "Each customer may have a different agreed amount, even on the same plan."),
            ("Flexible billing", "Monthly, weekly, one-time and manual billing types are supported."),
            ("No paid WhatsApp API", "The employee reviews and shares the PDF manually through WhatsApp."),
            ("Live access", "The current system is hosted online and works from a modern browser."),
        ]
    ),
    PageBreak(),
]

story += [
    SectionLabel(2, "Navigation and dashboard"),
    P("The employee starts from the Overview", "H1x"),
    P(
        "The left navigation opens Overview, Customers, Plans, Invoices, Payment history and Settings. "
        "Number badges show records or actions that need attention.",
    ),
    screenshot("dashboard"),
    Spacer(1, 3 * mm),
    P("What the dashboard shows", "H2x"),
    *bullets(
        [
            "<b>Active customers:</b> customers currently using a plan.",
            "<b>Monthly revenue:</b> expected recurring revenue based on active subscriptions.",
            "<b>Payment pending:</b> invoices issued but not yet paid.",
            "<b>Overdue:</b> invoices whose due date has passed without payment.",
            "<b>Invoices to send:</b> customers whose invoices are ready for employee action.",
            "<b>Plan breakdown:</b> distribution of customers across available plans.",
        ]
    ),
    info_box(
        "Recommended daily habit",
        "Open Overview at the start of the workday. Handle red overdue alerts first, then invoices ready to send, "
        "and finally pending payments.",
        colors.HexColor("#FFF5E6"),
    ),
    PageBreak(),
]

story += [
    SectionLabel(3, "Customer management"),
    P("Add and maintain customers", "H1x"),
    P(
        "The Customers section is the master directory. Employees can search by customer name, WhatsApp number "
        "or vehicle plate, then open the complete customer profile.",
    ),
    screenshot("customers"),
    Spacer(1, 3 * mm),
    feature_table(
        [
            ("Customer details", "Name, WhatsApp number and customer-since date."),
            ("Vehicle details", "Plate, building, flat and parking information."),
            ("Subscription", "Plan, agreed customer-specific price and start date."),
            ("Billing type", "Monthly, weekly, one-time or manual."),
            ("Next billing date", "The next service cycle; shown as Plan Expiry in the directory."),
            ("Archive", "Removes inactive customers from the active list without deleting history."),
            ("Restore", "Archived customers remain available under the Archived filter and can be restored."),
        ]
    ),
    Spacer(1, 3 * mm),
    info_box(
        "Important data-entry rule",
        "The Plan Start Date and Next Invoice Date must represent the customer's real agreement. "
        "For recurring plans, the system uses these dates to calculate every future cycle.",
    ),
    PageBreak(),
]

story += [
    SectionLabel(4, "Customer 360 profile"),
    P("Complete history for one customer", "H1x"),
    P(
        "Clicking a customer name opens a 360-degree profile. This is the fastest place to answer questions such as "
        "\"How long has this person been a customer?\", \"Which invoices are paid?\" and \"What is still outstanding?\"",
    ),
    screenshot("profile"),
    Spacer(1, 3 * mm),
    feature_table(
        [
            ("Overview", "Contact, vehicle, subscription, next billing date and latest invoice."),
            ("Invoices", "Complete invoice history with issue date, due date, amount and status."),
            ("Payments", "Recorded payments, dates, methods and references."),
            ("Activity", "Important customer actions such as invoice generation, edits and payment updates."),
            ("Summary cards", "Total invoiced, total paid, outstanding and overdue values."),
            ("Quick actions", "Edit customer, open WhatsApp or generate the next invoice."),
        ]
    ),
    PageBreak(),
]

story += [
    SectionLabel(5, "Plans and recurring billing"),
    P("How billing cycles are calculated", "H1x"),
    P(
        "A plan provides a default price, but the customer's agreed price is stored separately. "
        "This allows two customers on the Basic plan to pay different amounts.",
    ),
    feature_table(
        [
            ("Monthly", "A new cycle starts on the same day each month. Example: 28 Jul to 27 Aug."),
            ("Weekly", "A seven-day service period. Example: 01 Jul to 07 Jul."),
            ("One-time", "A single invoice only; recurring billing stops afterward."),
            ("Manual", "No automatic recurring invoice. The employee creates invoices when required."),
        ]
    ),
    Spacer(1, 5 * mm),
    P("Missed-cycle protection", "H2x"),
    P(
        "If the software was offline or a customer's billing date was missed, the scheduler catches up in date order. "
        "It creates each missing billing cycle, avoids duplicates, marks past-due invoices overdue and advances the "
        "customer to the correct next billing date.",
    ),
    info_box(
        "Example: Haroon",
        "Plan starts 28 February. If the next pending cycle is 28 April and the current date is 28 July, the system "
        "reconciles April, May, June and July. If July already exists, it is reused instead of duplicated. "
        "The next billing date becomes 28 August.",
        colors.HexColor("#EEF4FF"),
    ),
    Spacer(1, 5 * mm),
    P("Duplicate prevention", "H2x"),
    P(
        "Only one invoice can exist for the same customer and billing-period start date. Repeated clicks therefore "
        "open the existing invoice instead of creating another invoice for that cycle.",
    ),
    P("Invoice statuses", "H2x"),
    feature_table(
        [
            ("Pending", "Invoice exists but has not been confirmed as sent or paid."),
            ("Sent", "Employee confirms that the invoice was delivered."),
            ("Paid", "Payment was received and recorded."),
            ("Overdue", "The due date passed while payment remained outstanding."),
        ]
    ),
    PageBreak(),
]

story += [
    SectionLabel(6, "Invoices and PDF sharing"),
    P("Professional invoice workflow", "H1x"),
    screenshot("invoice"),
    Spacer(1, 3 * mm),
    numbered_steps(
        [
            ("Open or generate", "Use View PDF for a saved invoice or Generate Invoice for the next billing cycle."),
            ("Review", "Confirm customer, amount, issue date, due date and service period."),
            ("Edit if required", "Authorized staff can update description, amount or dates before sending."),
            ("Share PDF", "Use the share action where supported, or download the PDF and attach it in WhatsApp."),
            ("Confirm delivery", "After successful delivery, click Mark as sent."),
        ]
    ),
    Spacer(1, 3 * mm),
    P("Information printed on every invoice", "H2x"),
    *bullets(
        [
            "Company name, UAE address, mobile number and email.",
            "Customer name, WhatsApp number, vehicle and location details.",
            "Invoice number, issue date and payment due date.",
            "Service period showing exactly which week or month is being billed.",
            "Plan/service description, quantity and total amount in AED.",
        ]
    ),
    info_box(
        "WhatsApp behavior",
        "Browsers do not allow a website to silently attach a local PDF to WhatsApp. The employee shares or attaches "
        "the generated PDF and presses Send. This keeps the current version free from WhatsApp API charges.",
        colors.HexColor("#FFF5E6"),
    ),
]

story += [
    SectionLabel(7, "Invoice list, edits and payments"),
    P("Track every billing record", "H1x"),
    screenshot("invoices"),
    Spacer(1, 3 * mm),
    P("Available invoice actions", "H2x"),
    feature_table(
        [
            ("View PDF", "Opens the complete invoice preview for review and sharing."),
            ("Edit", "Changes description, amount, issue date or due date with a revision reason."),
            ("Mark as sent", "Records delivery status and time."),
            ("Mark as unsent", "Reverses an accidental sent action and returns the invoice to pending."),
            ("Mark paid", "Creates the payment record and removes the invoice from outstanding balances."),
        ]
    ),
    Spacer(1, 4 * mm),
    P("Payment history", "H2x"),
    P(
        "When an invoice is marked paid, the payment appears in Payment History and the Customer 360 profile. "
        "Paid totals, outstanding balances and overdue amounts update automatically.",
    ),
    info_box(
        "Status priority",
        "If the newest invoice is paid but an older invoice is still overdue, the customer remains marked "
        "Payment overdue. This prevents old unpaid balances from being hidden.",
        colors.HexColor("#FDECEC"),
    ),
    PageBreak(),
]

story += [
    SectionLabel(8, "Employee operating procedure"),
    P("Daily step-by-step routine", "H1x"),
    numbered_steps(
        [
            ("Open Overview", "Check red alerts, expired plans, invoices ready to send and overdue payments."),
            ("Review urgent customers", "Open the customer profile to understand full invoice and payment history."),
            ("Prepare invoices", "Open each ready invoice and verify its service period and agreed amount."),
            ("Share through WhatsApp", "Share/download the PDF, select the correct customer and send it."),
            ("Update delivery", "Click Mark as sent only after confirming the message was delivered."),
            ("Record payments", "When payment arrives, mark the matching invoice paid and add payment details."),
            ("Correct mistakes", "Use Unsent for an accidental sent status or Edit Invoice for billing corrections."),
        ]
    ),
    Spacer(1, 5 * mm),
    P("Monthly control checklist", "H2x"),
    feature_table(
        [
            ("Customer data", "Check new, archived and restored customer records."),
            ("Billing dates", "Review expired or soon-to-expire plans."),
            ("Invoice exceptions", "Investigate customers with missing or overdue cycles."),
            ("Payment matching", "Confirm every received payment is linked to the correct invoice."),
            ("Settings", "Confirm company contact and invoice prefix remain correct."),
        ]
    ),
    Spacer(1, 4 * mm),
    info_box(
        "Best practice",
        "Do not mark an invoice paid until money is actually received. Do not mark it sent until the PDF/message "
        "has been delivered. These two controls keep dashboard totals reliable.",
    ),
    PageBreak(),
]

story += [
    SectionLabel(9, "Administration and current scope"),
    P("System configuration", "H1x"),
    feature_table(
        [
            ("Company details", "Name, UAE address, phone and email printed on invoices."),
            ("Invoice prefix", "Controls the beginning of invoice numbers, for example JMCW."),
            ("Plans", "Create, edit and deactivate reusable plan templates."),
            ("Database", "PostgreSQL stores customer, invoice, payment and activity history."),
            ("Hosting", "The live demo currently runs on Railway and requires an active hosting plan long-term."),
        ]
    ),
    Spacer(1, 5 * mm),
    P("Current Version 1.0 boundaries", "H2x"),
    *bullets(
        [
            "<b>WhatsApp is employee-assisted:</b> no paid Cloud API or automatic background delivery.",
            "<b>Invoices are generated automatically:</b> delivery still requires employee confirmation.",
            "<b>Internet is required:</b> the live application and cloud database are online services.",
            "<b>User login/roles:</b> should be added before giving access to multiple independent staff members if not already protected by the hosting environment.",
            "<b>Backups and hosting:</b> production use should include a paid database/hosting plan and an agreed backup policy.",
        ]
    ),
    Spacer(1, 4 * mm),
    info_box(
        "Suggested Phase 2 options",
        "Role-based login, automatic WhatsApp Cloud API delivery, bulk import from Excel, downloadable business "
        "reports, automated database backups and branded domain/email can be added when approved by the client.",
        colors.HexColor("#EEF4FF"),
    ),
    PageBreak(),
]

story += [
    SectionLabel(10, "Client review and acceptance"),
    P("Recommended demonstration sequence", "H1x"),
    numbered_steps(
        [
            ("Show Overview", "Explain alerts, pending amounts and navigation."),
            ("Add a sample customer", "Use a custom agreed price and monthly billing date."),
            ("Open Customer 360", "Show subscription, invoice history, payments and activity."),
            ("Generate an invoice", "Point out issue date, due date and service period."),
            ("Share the PDF", "Demonstrate the employee-assisted WhatsApp process."),
            ("Mark it sent and paid", "Show status and totals updating across the system."),
            ("Explain automation", "Demonstrate monthly renewal, duplicate protection and missed-cycle recovery."),
        ]
    ),
    Spacer(1, 6 * mm),
    P("Acceptance checklist", "H2x"),
    feature_table(
        [
            ("Customer records", "Client confirms required customer and vehicle fields."),
            ("Plan rules", "Client confirms monthly, weekly, one-time and manual behavior."),
            ("Invoice layout", "Client approves company details, service period and total format."),
            ("Payment workflow", "Client approves sent, unsent, paid and overdue meanings."),
            ("Employee process", "Staff can follow the daily procedure without developer assistance."),
            ("Production plan", "Client approves hosting, backups, users and future WhatsApp automation scope."),
        ]
    ),
    Spacer(1, 10 * mm),
    info_box(
        "Support contact shown on invoices",
        "<b>Mobile:</b> +971 52 8843059<br/><b>Email:</b> jmcarwashandcleaning@gmail.com",
    ),
]

doc.build(story)
print(OUTPUT)
