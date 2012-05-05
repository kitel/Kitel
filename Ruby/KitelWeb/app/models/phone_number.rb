class PhoneNumber < ActiveRecord::Base
  has_one :Provider
  has_one :Service

  def to_e164
    '+1' + area_code + number
  end

 def as_json(options={})

  if (options && options[:numbers_list])
     result = { :number => self.to_e164}
  else
     result = super(options)
  end

  result
 end
end
