"""add hardware item image

Revision ID: ca1c9cb643fe
Revises: 61fd848df8c1
Create Date: 2026-03-16 12:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "ca1c9cb643fe"
down_revision = "61fd848df8c1"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("hardware_items", sa.Column("image_url", sa.String(), nullable=True))


def downgrade():
    op.drop_column("hardware_items", "image_url")
