"""add site settings

Revision ID: 3f6f0b7d4c92
Revises: bf111ce50766
Create Date: 2026-03-16 11:35:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "3f6f0b7d4c92"
down_revision = "bf111ce50766"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("whatsapp_number", sa.String(length=32), nullable=True),
        sa.Column("google_business_name", sa.String(length=255), nullable=True),
        sa.Column("google_reviews_json", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("site_settings")
