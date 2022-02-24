import {
  Extension,
  ExtensionSpec,
  ExtensionVersion,
  RegistryLaunchStage,
  Visibility,
} from '../models';

export const EXTENSION_SPEC: ExtensionSpec = {
  specVersion: 'v1beta',
  name: 'good-tool',
  version: '0.0.1',
  displayName: 'Good Tool',
  description: 'Does something really useful',
  apis: [
    {
      apiName: 'storage-component.googleapis.com',
      reason: 'Needed to use Cloud Storage',
    },
  ],
  roles: [
    {
      role: 'storage.admin',
      reason: 'Allows the extension to store resized images in Cloud Storage',
    },
  ],
  resources: [
    {
      type: 'firebaseextensions.v1beta.function',
      description:
        'Listens for new images uploaded to your specified Cloud Storage bucket, resizes the images, then stores the resized images in the same bucket. Optionally keeps or deletes the original images.',
      name: 'generateResizedImage',
      propertiesYaml:
        'availableMemoryMb: 1024\neventTrigger:\n  eventType: google.storage.object.finalize\n  resource: projects/_/buckets/${param:IMG_BUCKET}\nlocation: ${param:LOCATION}\nruntime: nodejs14\n',
    },
  ],
  billingRequired: true,
  author: {
    authorName: 'Awesome Inc',
    url: 'https://google.com/awesome',
  },
  license: 'MIT',
  releaseNotesUrl: 'https://google.com/awesome/release-notes',
  params: [],
  postinstallContent: '### See it in action',
  externalServices: [
    {
      name: 'blockchain co.',
      pricingUri: 'https://google.com/blockchain',
    },
  ],
};

export const EXTENSION_VERSION: ExtensionVersion = {
  name: 'publishers/awesome-inc/extensions/good-tool/versions/0.0.1',
  ref: 'awesome-inc/good-tool@0.0.1',
  state: 'PUBLISHED',
  spec: EXTENSION_SPEC,
  hash: '12345',
  sourceDownloadUri: 'https://google.com/asdf',
  releaseNotes: 'Hello world! Say hi to a good tool',
  createTime: '2021-10-27T00:00:00.000Z',
};

export const EXTENSION: Extension = {
  name: 'publishers/awesome-inc/extensions/good-tool',
  ref: 'awesome-inc/good-tool',
  visibility: Visibility.PUBLIC,
  registryLaunchStage: RegistryLaunchStage.GA,
  createTime: '2021-10-27T00:00:00.000Z',
};
