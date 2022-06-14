export interface IServiceResponse {
  /**
   * A response code; typically equivalent to an HTTP Response Status Code.
   */
  code: number;

  /**
   * A response message; detailling the status of the resonse.
   */
  message: string;

  /**
   * A response name; typically equivalent to an HTTP Response Reason Phrase.
   */
  name: string;

  /**
   * Optional data. Typically used to return data in response to a request that was processed successfully.
   */
  data?: any;

  /**
   * Optional errors . Typically used to return detailled error information in response to a request that was not processed successfully.
   */
  errors?: any;
}

export interface OCPPoint {
  _id: {
    $oid: string
  };
  ID: number;
  UUID: string;
  ParentChargePointID: number;
  DataProviderID: number;
  DataProvidersReference: string;
  OperatorID: number;
  OperatorsReference: string;
  UsageTypeID: number;
  UsageCost: string;
  AddressInfo: {
    ID: number;
    Title: string;
    AddressLine1: string;
    AddressLine2: string;
    Town: string;
    StateOrProvince: string;
    Postcode: string;
    CountryID: number;
    Country: {
      ID: number;
      Title: string;
      ISOCode: string;
      ContinentCode: string;
    };
    Latitude: number;
    Longitude: number;
    ContactTelephone1: string;
    ContactTelephone2: string;
    ContactEmail: string;
    AccessComments: string;
    RelatedURL: string;
    Distance: string;
    DistanceUnit: number;
    GeneralComments: string
  };
  Connections: [{
    ID: number;
    ConnectionTypeID: number;
    ConnectionType: {
      ID: number;
      Title: string;
      FormalName: string;
      IsDiscontinued: boolean;
      IsObsolete: boolean
    };
    Reference: string;
    StatusTypeID: number;
    StatusType: number;
    LevelID: number;
    Level: {
      ID: number;
      Title: string;
      Comments: string;
      IsFastChargeCapable: boolean;
    };
    Amps: number;
    Voltage: number;
    PowerKW: number;
    CurrentTypeID: number;
    CurrentType: number;
    Quantity: number;
    Comments: string;
  }];
  NumberOfPoints: number;
  GeneralComments: string;
  DatePlanned: string;
  DateLastConfirmed: {
    $date: string;
  };
  StatusTypeID: number;
  DateLastStatusUpdate: {
    $date: string;
  };
  MetadataValues: string;
  DataQualityLevel: number;
  DateCreated: {
    $date: string;
  };
  SubmissionStatusTypeID: number;
  AddressCleaningRequired: boolean;
  DataProvider: {
    ID: number;
    Title: string;
    WebsiteURL: string;
    Comments: string;
    DataProviderStatusType: {
      ID: number;
      Title: string;
      IsProviderEnabled: boolean;
    };
    IsRestrictedEdit: boolean;
    IsOpenDataLicensed: boolean;
    IsApprovedImport: boolean;
    License: string;
    DateLastImported: string;
  };
  OperatorInfo: {
    ID: number;
    Title: string;
    WebsiteURL: string;
    Comments: string;
    PhonePrimaryContact: string;
    PhoneSecondaryContact: string;
    IsPrivateIndividual: boolean;
    AddressInfo: string;
    BookingURL: string;
    ContactEmail: string;
    FaultReportEmail: string;
    IsRestrictedEdit: boolean;
  };
  UsageType: {
    ID: number;
    Title: string;
    IsPayAtLocation: boolean;
    IsMembershipRequired: boolean;
    IsAccessKeyRequired: boolean;
  };
  StatusType: {
    ID: number;
    Title: string;
    IsOperational: true;
    IsUserSelectable: true
  };
  SubmissionStatus: {
    ID: number;
    Title: string;
    IsLive: true
  };
  UserComments: string;
  PercentageSimilarity: number;
  MediaItems: [{
    ID: number;
    ChargePointID: number;
    ItemURL: string;
    ItemThumbnailURL: string;
    Comment: string;
    IsEnabled: boolean;
    IsVideo: boolean;
    IsFeaturedItem: boolean;
    IsExternalResource: boolean;
    MetadataValue: string;
    User: {
      ID: number;
      IdentityProvider: number;
      Identifier: string;
      CurrentSessionToken: string;
      Username: string;
      Profile: string;
      Location: string;
      WebsiteURL: string;
      ReputationPoints: number;
      Permissions: string;
      PermissionsRequested: string;
      DateCreated: string;
      DateLastLogin: string;
      IsProfilePublic: boolean;
      IsEmergencyChargingProvider: boolean;
      IsPublicChargingProvider: boolean;
      Latitude: number;
      Longitude: number;
      EmailAddress: string;
      EmailHash: string;
      ProfileImageURL: string;
      IsCurrentSessionTokenValid: boolean;
      APIKey: string;
      SyncedSettings: boolean;
    };
    DateCreated: {
      $date: string;
    }
  }];
  LevelOfDetail: number;
  Chargers: number;
  MetadataTags: string;
  SpatialPosition: {
    type: string;
    coordinates: number[];
  }
}