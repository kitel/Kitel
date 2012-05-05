class Service < ActiveRecord::Base
  has_one :Partner
  belongs_to :PhoneNumber, :foreign_key => "phonenumber_id"

  def as_json(options=nil)
    result = { :service_id => id,
               :account_number => self.PhoneNumber.to_e164,
               :user_number => user_phone_number,
               :start_time => start_date,
               :service_period => service_period
            }

    result
  end
end
