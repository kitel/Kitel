xml.instruct!
xml.area_codes do
  @area_codes.each do |code|
      xml.area_code code.area_code
  end
end