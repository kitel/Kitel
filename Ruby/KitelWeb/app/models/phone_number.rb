class PhoneNumber < ActiveRecord::Base
  has_one :Provider
end
