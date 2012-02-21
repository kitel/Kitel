xml.instruct!
xml.numbers_list do
  @phone_numbers.each do |number|
    xml.number number.to_e164
  end
end
