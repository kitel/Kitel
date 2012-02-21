class CreatePhoneNumbers < ActiveRecord::Migration
  def change
    create_table :phone_numbers do |t|
      t.string :area_code
      t.string :number
      t.integer :provider_id
      t.boolean :reserved
      t.boolean :active

      t.timestamps
    end
  end
end
