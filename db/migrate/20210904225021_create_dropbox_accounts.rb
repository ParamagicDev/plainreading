class CreateDropboxAccounts < ActiveRecord::Migration[6.1]
  def change
    create_table :dropbox_accounts do |t|
      t.references :user, null: false, foreign_key: true
      t.text :token
      t.string :filepath

      t.timestamps
    end
  end
end
