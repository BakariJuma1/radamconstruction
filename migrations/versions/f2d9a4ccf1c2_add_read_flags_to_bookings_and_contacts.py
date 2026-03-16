"""add read flags to bookings and contacts

Revision ID: f2d9a4ccf1c2
Revises: ca1c9cb643fe
Create Date: 2026-03-16 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "f2d9a4ccf1c2"
down_revision = "ca1c9cb643fe"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("booking", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false())
        )

    with op.batch_alter_table("contacts", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false())
        )


def downgrade():
    with op.batch_alter_table("contacts", schema=None) as batch_op:
        batch_op.drop_column("is_read")

    with op.batch_alter_table("booking", schema=None) as batch_op:
        batch_op.drop_column("is_read")
