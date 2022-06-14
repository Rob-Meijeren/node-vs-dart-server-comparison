import { GET, Path, QueryParam } from 'typescript-rest';
import { Produces, Response, Tags } from 'typescript-rest-swagger';
import { IServiceResponse, OCPPoint } from '../../../typings/api';
import { IChargeLocation } from '../../../typings/database';
import * as request from 'request-promise-native';
import { datastore } from '../../..';
import { isNil } from 'lodash';
import Knex from 'knex';

@Path('/charge_locations')
@Produces('applicaton/json')
@Tags('Charge Locations')
export class ChargeLocations {

  /**
   *
   * @returns {}
   * @memberof ChargeLocationsAndParkingZones
   */
   @Response<IChargeLocation[]>(200, 'All charge locations that have been mapped to a parking zone')
   @GET
   public async fetchAll(
     @QueryParam('northeast') northEast: string,
     @QueryParam('southwest') southWest: string,
   ): Promise<IChargeLocation[]> {
     let whereClause = {};
 
     if (!isNil(southWest) && !isNil(northEast)) {
       const splitNorthEastCoordinate = northEast.split(',');
       const nortEastLatitude = parseFloat(splitNorthEastCoordinate[0]);
       const northEastLongitude = parseFloat(splitNorthEastCoordinate[1]);
       const splitSouthWestCoordinate = southWest.split(',');
       const southWestLatitude = parseFloat(splitSouthWestCoordinate[0]);
       const southWestLongitude = parseFloat(splitSouthWestCoordinate[1]);
 
       whereClause = (builder: Knex.QueryBuilder) => {
         builder.where('latitude', '>=', southWestLatitude);
         builder.andWhere('latitude', '<=', nortEastLatitude);
         builder.andWhere('longitude', '>=', southWestLongitude);
         builder.andWhere('longitude', '<=', northEastLongitude);
       };
     }
 
     const allChargeLocations = await datastore.chargeLocations.list(
       undefined,
       undefined,
       undefined,
       undefined,
       whereClause,
     );
 
     return allChargeLocations;
   }

  /**
   *
   * @returns {IServiceResponse}
   * @memberof ChargeLocations
   */
  @Path('/sync')
  @Response<IServiceResponse>(200, 'The result of the synchronisation of charge locations')
  @GET
  public async sync(): Promise<IServiceResponse> {
    const apiEndpoint = 'https://api.openchargemap.io/v3/poi/?output=json&countrycode=NL&maxresults=500000&key=baacdd06-78c6-4c9c-8778-1c0a00b3d5b0';

    let apiResponse: OCPPoint[] = [];
    try {
      apiResponse = JSON.parse(await request.get(apiEndpoint));
    } catch (e) {
      console.error('error fetching data from open charge map', e);
      throw {
        code: 500,
        name: 'INTERNAL_SERVER_ERROR',
        message: 'something went wrong getting the data from open charge map'
      };
    }

    for (const ocpPoint of apiResponse) {
      const ocpPointbyUUID = await datastore.chargeLocations.getByUUID(ocpPoint.UUID);

      if (!isNil(ocpPointbyUUID) && ocpPointbyUUID.length > 0) {
        continue;
      }

      const newChargeLocation: IChargeLocation = {
        uuid: ocpPoint.UUID,
        operator_id: ocpPoint.OperatorID,
        address_name: ocpPoint.AddressInfo.Title,
        address_line_1: ocpPoint.AddressInfo.AddressLine1,
        address_line_2: ocpPoint.AddressInfo.AddressLine2,
        address_city: ocpPoint.AddressInfo.Town,
        address_state: ocpPoint.AddressInfo.StateOrProvince,
        address_postalcode: ocpPoint.AddressInfo.Postcode,
        address_country: ocpPoint.AddressInfo.Country.ISOCode,
        latitude: ocpPoint.AddressInfo.Latitude,
        longitude: ocpPoint.AddressInfo.Longitude,
        contact_phone: ocpPoint.AddressInfo.ContactTelephone1,
        contact_email: ocpPoint.AddressInfo.ContactEmail,
      }

      await datastore.chargeLocations.add(newChargeLocation);
    }
    
    return {
      code: 200,
      name: 'SUCCESS',
      message: 'The charge locations are synced',
    };
  }
}