# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "mysql2"
  s.version = "0.3.11"
  s.platform = "x86-mingw32"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Brian Lopez"]
  s.date = "2011-12-06"
  s.email = "seniorlopez@gmail.com"
  s.homepage = "http://github.com/brianmario/mysql2"
  s.post_install_message = "\n======================================================================================================\n\n  You've installed the binary version of mysql2.\n  It was built using MySQL Connector/C version 6.0.2.\n  It's recommended to use the exact same version to avoid potential issues.\n\n  At the time of building this gem, the necessary DLL files where available\n  in the following download:\n\n  http://dev.mysql.com/get/Downloads/Connector-C/mysql-connector-c-noinstall-6.0.2-win32.zip/from/pick\n\n  And put lib\\libmysql.dll file in your Ruby bin directory, for example C:\\Ruby\\bin\n\n======================================================================================================\n\n"
  s.rdoc_options = ["--charset=UTF-8"]
  s.require_paths = ["lib"]
  s.rubygems_version = "1.8.16"
  s.summary = "A simple, fast Mysql library for Ruby, binding to libmysql"

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<eventmachine>, [">= 0"])
      s.add_development_dependency(%q<rake-compiler>, ["~> 0.7.7"])
      s.add_development_dependency(%q<rake>, ["= 0.8.7"])
      s.add_development_dependency(%q<rspec>, [">= 0"])
      s.add_development_dependency(%q<activerecord>, [">= 0"])
      s.add_development_dependency(%q<mysql>, [">= 0"])
      s.add_development_dependency(%q<do_mysql>, [">= 0"])
      s.add_development_dependency(%q<sequel>, [">= 0"])
      s.add_development_dependency(%q<faker>, [">= 0"])
    else
      s.add_dependency(%q<eventmachine>, [">= 0"])
      s.add_dependency(%q<rake-compiler>, ["~> 0.7.7"])
      s.add_dependency(%q<rake>, ["= 0.8.7"])
      s.add_dependency(%q<rspec>, [">= 0"])
      s.add_dependency(%q<activerecord>, [">= 0"])
      s.add_dependency(%q<mysql>, [">= 0"])
      s.add_dependency(%q<do_mysql>, [">= 0"])
      s.add_dependency(%q<sequel>, [">= 0"])
      s.add_dependency(%q<faker>, [">= 0"])
    end
  else
    s.add_dependency(%q<eventmachine>, [">= 0"])
    s.add_dependency(%q<rake-compiler>, ["~> 0.7.7"])
    s.add_dependency(%q<rake>, ["= 0.8.7"])
    s.add_dependency(%q<rspec>, [">= 0"])
    s.add_dependency(%q<activerecord>, [">= 0"])
    s.add_dependency(%q<mysql>, [">= 0"])
    s.add_dependency(%q<do_mysql>, [">= 0"])
    s.add_dependency(%q<sequel>, [">= 0"])
    s.add_dependency(%q<faker>, [">= 0"])
  end
end
