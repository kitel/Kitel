class CreateProviders < ActiveRecord::Migration
  def change
    create_table :providers do |t|
      t.string :name
      t.integer :type
      t.string :description

      t.timestamps
    end
  end
end
