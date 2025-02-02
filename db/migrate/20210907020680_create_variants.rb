class CreateVariants < ActiveRecord::Migration[6.1]
  def change
    create_table :variants do |t|
      t.string :isbn
      t.text :extra_info
      t.references :length, polymorphic: true
      t.references :item, null: false, foreign_key: true
      t.references :format, foreign_key: true

      t.timestamps
    end
  end
end
