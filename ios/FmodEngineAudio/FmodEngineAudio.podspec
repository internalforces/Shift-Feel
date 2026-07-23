Pod::Spec.new do |spec|
  spec.name = 'FmodEngineAudio'
  spec.version = '0.1.0'
  spec.summary = 'Shift Feel FMOD Engine bridge'
  spec.homepage = 'https://github.com/internalforces/Shift-Feel'
  spec.license = { :type => 'Proprietary', :text => 'FMOD SDK supplied separately' }
  spec.author = { 'Shift Feel' => 'internalforces' }
  spec.platform = :ios, '15.1'
  spec.source = { :path => '.' }
  spec.source_files = '*.{h,mm}'
  spec.public_header_files = 'FmodEngineAudio.h'
  spec.header_mappings_dir = '.'
  spec.vendored_frameworks = [
    'vendor/api/core/lib/ios/fmod.xcframework',
    'vendor/api/studio/lib/ios/fmodstudio.xcframework'
  ]
  spec.preserve_paths = 'banks/*.bank'
  spec.resources = 'banks/*.bank'
  spec.frameworks = ['AVFAudio', 'AudioToolbox']
  spec.libraries = ['c++']
  spec.dependency 'React-Core'
  spec.pod_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => [
      '$(PODS_TARGET_SRCROOT)/vendor/api/core/inc',
      '$(PODS_TARGET_SRCROOT)/vendor/api/studio/inc'
    ].join(' ')
  }
end
