# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "rack-jsonp-middleware"
  s.version = "0.0.5"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Roberto Decurnex"]
  s.date = "2010-12-29"
  s.description = "A Rack JSONP middleware"
  s.email = "nex.development@gmail.com"
  s.homepage = "http://robertodecurnex.github.com/rack-jsonp-middleware"
  s.require_paths = ["lib"]
  s.rubygems_version = "1.8.16"
  s.summary = "rack-jsonp-middleware-0.0.5"

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<rack>, [">= 0"])
      s.add_development_dependency(%q<rspec>, [">= 1.3.0"])
    else
      s.add_dependency(%q<rack>, [">= 0"])
      s.add_dependency(%q<rspec>, [">= 1.3.0"])
    end
  else
    s.add_dependency(%q<rack>, [">= 0"])
    s.add_dependency(%q<rspec>, [">= 1.3.0"])
  end
end
