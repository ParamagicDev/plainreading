class CreateVisibilityConfigs < ActiveRecord::Migration[6.1]
  def change
    create_table :visibility_configs do |t|
      t.integer :level
      t.float :minimum_rating
      t.text :hidden_genres
      t.boolean :formats_visible
      t.boolean :group_experiences_visible
      t.boolean :planned_visible
      t.boolean :public_notes_visible
      t.boolean :private_notes_visible
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
