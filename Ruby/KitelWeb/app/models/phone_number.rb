class PhoneNumber < ActiveRecord::Base
  has_one :Provider
  has_one :Service

  def to_e164
    '+1' + area_code + number
  end
end
