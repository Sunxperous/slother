# Preinstallation stage for apt-get update.
stage { 'preinstall':
  before => Stage['main'],
}
class apt_get_update {
  exec { 'apt-get update':
    path => '/usr/bin',
    logoutput => on_failure,
    returns => [0, 100],
  }
}
class { 'apt_get_update': 
  stage => preinstall,
}

# Installs node.js via Puppet module nodejs.
class install_nodejs {
  class { 'nodejs':
    version => 'stable',
  }
}
class { 'install_nodejs': }

# Installs global npm modules: 
# after installing node.js.
class install_npm_packages {
  package { 'browser-sync':
    provider => 'npm',
    ensure => '0.9.1'
  }
  package { 'supervisor':
    provider => 'npm',
  }
}
class { 'install_npm_packages':
  require => [
    Class['install_nodejs']
  ]
}

# Installs local npm modules into /vagrant/node_modules/ without symlinks,
# after installing global npm modules.
exec { 'npm install --no-bin-link':
  cwd => '/vagrant',
  path => '/usr/local/node/node-default/bin',
  require => Class['install_npm_packages'],
}

# Installs Git.
package { 'git':
  ensure => installed,
}

# Installs Vim.
package { 'vim':
  ensure => installed,
}