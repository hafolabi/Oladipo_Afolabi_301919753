"""Draw the five AfolabiPay tables as an SVG picture.

This helper only makes the diagram; it does not create or test the database.
It reads the column names, types, and keys from er_diagram.mmd. The box positions
and relationship lines below are set by hand. Update them if the links change.
It uses Python's built-in libraries, so there is nothing extra to install.
"""
from html import escape
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
source = (ROOT / "er_diagram.mmd").read_text()
entities = {}
for name, body in re.findall(r"^    (\w+) \{\n(.*?)^    \}", source, re.M | re.S):
    entities[name] = []
    for line in body.splitlines():
        parts = line.strip().split()
        if len(parts) >= 2:
            keys = parts[2] if len(parts) > 2 and parts[2][0] != '"' else ""
            entities[name].append((parts[1], parts[0], keys))

layout = {
    "CUSTOMERS": (45, 170, 445),
    "ACCOUNTS": (45, 625, 445),
    "TRANSACTION_ENTRIES": (620, 625, 455),
    "TRANSACTIONS": (1145, 170, 500),
    "AUDIT_EVENTS": (1145, 755, 500),
}
assert set(entities) == set(layout), "Update layout for the changed model"
nullable = {
    ("ACCOUNTS", "customer_id"),
    ("TRANSACTIONS", "reversal_of_transaction_id"),
    ("TRANSACTIONS", "posted_at"),
    ("TRANSACTIONS", "failure_reason"),
    ("AUDIT_EVENTS", "transaction_id"),
}
svg = ['''<svg xmlns="http://www.w3.org/2000/svg" width="1720" height="1120" viewBox="0 0 1720 1120" role="img" aria-labelledby="title description">
<title id="title">AfolabiPay entity relationship diagram</title>
<desc id="description">Five tables with primary, unique and foreign keys. A customer has zero or more accounts. A customer account requires one owner; clearing has none. Accounts and transactions each have zero or more entries. Audit events optionally reference a transaction. Reversals optionally reference an original payment. Posted payments require exactly two balanced entries as an additional business rule.</desc>
<style>
text { font-family: Arial, Helvetica, sans-serif; fill: #182f40; }
.title { font-size: 30px; font-weight: 700; }
.subtitle { font-size: 18px; fill: #456174; }
.heading { font-size: 19px; font-weight: 700; fill: white; }
.field { font-family: Menlo, Consolas, monospace; font-size: 14px; }
.key { font-family: Menlo, Consolas, monospace; font-size: 13px; font-weight: 700; fill: #17675d; }
.type { font-family: Menlo, Consolas, monospace; font-size: 13px; fill: #526777; }
.label { font-size: 17px; }
.cardinality { font-size: 16px; font-weight: 700; fill: #17675d; }
.note { font-size: 17px; }
.edge { fill: none; stroke: #658493; stroke-width: 2.5; }
</style>
<rect width="1720" height="1120" fill="#fff"/>
<text x="45" y="51" class="title">AfolabiPay — relational database design</text>
<text x="45" y="83" class="subtitle">PK: primary key · UK: unique candidate key · FK: foreign key · ?: nullable · Amounts: whole NGN kobo</text>
<path class="edge" d="M267 429 V625"/>
<text x="281" y="453" class="cardinality">0..1</text>
<text x="281" y="612" class="cardinality">0..*</text>
<text x="281" y="530" class="label">owns</text>
<path class="edge" d="M490 690 H620"/>
<text x="500" y="681" class="cardinality">1</text>
<text x="574" y="681" class="cardinality">0..*</text>
<text x="510" y="720" class="label">entries</text>
<path class="edge" d="M1270 458 V560 H847 V625"/>
<text x="1282" y="482" class="cardinality">1</text>
<text x="860" y="614" class="cardinality">0..*</text>
<text x="945" y="547" class="label">has entries</text>
<path class="edge" d="M1510 458 V755"/>
<text x="1524" y="484" class="cardinality">0..1</text>
<text x="1524" y="742" class="cardinality">0..*</text>
<text x="1524" y="604" class="label">audit events</text>
<path class="edge" d="M1510 170 V130 H1680 V315 H1645"/>
<text x="1455" y="158" class="cardinality">0..1</text>
<text x="1651" y="303" class="cardinality">0..*</text>
<text x="1375" y="118" class="label">original / reversal attempts</text>
''']

for name, (x, y, width) in layout.items():
    rows = entities[name]
    height = 44 + 29 * len(rows) + 12
    svg.append(f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="8" fill="#f7fafc" stroke="#b5c7d0"/>')
    svg.append(f'<path d="M{x+8} {y} H{x+width-8} Q{x+width} {y} {x+width} {y+8} V{y+44} H{x} V{y+8} Q{x} {y} {x+8} {y}" fill="#234c62"/>')
    svg.append(f'<text x="{x+16}" y="{y+29}" class="heading">{name.lower()}</text>')
    for i, (field, datatype, keys) in enumerate(rows):
        baseline = y + 67 + i * 29
        if i % 2 == 1:
            svg.append(f'<rect x="{x+1}" y="{baseline-21}" width="{width-2}" height="29" fill="#eef4f7"/>')
        svg.append(f'<text x="{x+14}" y="{baseline}" class="key">{escape(keys)}</text>')
        svg.append(f'<text x="{x+88}" y="{baseline}" class="field">{escape(field)}</text>')
        svg.append(f'<text x="{x+width-105}" y="{baseline}" class="type">{escape(datatype)}</text>')
        if (name, field) in nullable:
            svg.append(f'<text x="{x+width-17}" y="{baseline}" class="key">?</text>')

svg.extend(['''
<rect x="620" y="820" width="455" height="165" rx="8" fill="#eff7f3" stroke="#b8d5c7"/>
<text x="640" y="851" class="label" font-weight="700">Business rules beyond foreign keys</text>
<text x="640" y="882" class="note">Posted payment: 2 entries, sum = 0</text>
<text x="640" y="909" class="note">Pending / failed: no committed entries</text>
<text x="640" y="936" class="note">Customer account: exactly one owner</text>
<text x="640" y="963" class="note">Clearing account: no customer owner</text>
<text x="45" y="1044" class="subtitle">Cardinalities show the physical foreign-key model. Completion, reversal and balance rules need cross-row checks.</text>
<text x="45" y="1074" class="subtitle">Source: er_diagram.mmd · Implementation: schema.sql · Five tables, all accounts in NGN</text>
</svg>
'''])
output = "\n".join(svg)
ET.fromstring(output)
destination = ROOT / "er_diagram.svg"
destination.write_text(output)
print(f"Exported {destination.name}: {len(entities)} entities, {sum(map(len, entities.values()))} attributes")
