class Service < ActiveRecord::Base
  has_one :Partner
  belongs_to :PhoneNumber, :foreign_key => "phonenumber_id"
end
