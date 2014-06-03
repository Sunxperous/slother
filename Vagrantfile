Vagrant.configure('2') do |config|
  config.vm.box = 'precise32'
  config.vm.box_url = 'http://files.vagrantup.com/precise32.box'
  config.vm.network 'forwarded_port', guest: 80, host: 4000
  #config.vm.network 'forwarded_port', guest: 35729, host: 35729

  for i in 8000..8020 do
    config.vm.network 'forwarded_port', guest: i, host: i
  end
  
  config.vm.provision 'puppet' do |puppet|
    puppet.manifests_path = 'puppet/manifests'
    puppet.module_path = 'puppet/modules'
  end
end
