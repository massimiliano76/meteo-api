import { Injectable, HttpService } from '@nestjs/common';
import { Coordinates } from '@/interfaces/coordinates.interface';
import { CacheService } from './cache.service';

@Injectable()
export class GeoLocateService {
    constructor(
        private readonly http: HttpService,
        private readonly cache: CacheService,
    ) { }
    /**
     * Get ip adderss location. Check for value in cache and if not found calls the ip-api.
     * @param ip ip address to locate
     * @returns Lat/lng associated connected with given ip
     */
    async getIpLocation(ip: string = ''): Promise<Coordinates> {
        const cachedValue = this.cache.get(ip) as Coordinates;
        if (cachedValue) {
            return cachedValue;
        }
        else {
            const coordinates = await this.locateIp(ip);
            this.cache.set(ip, coordinates);
            return coordinates;
        }
    }

    private async locateIp(ip: string = ''): Promise<Coordinates> {
        try {
            // Note: ip-api returns 200 OK even on invalid requests.
            const data = await this.http.get(`http://ip-api.com/json/${ip}`).toPromise();
            if (data['data'].status === 'fail') {
                throw new Error(data['data'].message);
            }
            const point = {
                lat: data['data'].lat,
                lng: data['data'].lon,
            };
            return point;
        }
        catch (e) {
            const message = e !== undefined ? e : 'IP location service request failed.';
            throw new Error(message);
        }
    }
}
