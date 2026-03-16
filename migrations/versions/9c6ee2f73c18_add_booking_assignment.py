"""add booking assignment

Revision ID: 9c6ee2f73c18
Revises: f2d9a4ccf1c2
Create Date: 2026-03-16 00:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9c6ee2f73c18"
down_revision = "f2d9a4ccf1c2"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("booking", schema=None) as batch_op:
        batch_op.add_column(sa.Column("assigned_user_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_booking_assigned_user_id_users",
            "users",
            ["assigned_user_id"],
            ["id"],
        )


def downgrade():
    with op.batch_alter_table("booking", schema=None) as batch_op:
        batch_op.drop_constraint("fk_booking_assigned_user_id_users", type_="foreignkey")
        batch_op.drop_column("assigned_user_id")
