class Service < ActiveRecord::Base
  has_one :PhoneNumber
  has_one :Partner
end
