"""added users

Revision ID: 766c4e985933
Revises: df11c24e5ff8
Create Date: 2024-05-22 23:01:58.277214

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '766c4e985933'
down_revision = 'df11c24e5ff8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('username')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('users')
    # ### end Alembic commands ###