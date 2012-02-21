class CreateServices < ActiveRecord::Migration
  def change
    create_table :services do |t|
      t.integer :phonenumber_id
      t.integer :partner_id
      t.string :user_phone_number
      t.date :start_date
      t.integer :service_period

      t.timestamps
    end
  end
end
