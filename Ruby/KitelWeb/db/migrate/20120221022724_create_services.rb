class CreateServices < ActiveRecord::Migration
  def change
    create_table :services do |t|
      t.integer :phonenumber_id, :null =>false
      t.integer :partner_id
      t.string :user_phone_number
      t.date :start_date
      t.integer :service_period

      t.timestamps
    end
    add_index :services, [:phonenumber_id], :unique => true
  end
end
