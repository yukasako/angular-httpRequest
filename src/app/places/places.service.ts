import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';

import { Place } from './place.model';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient);
  private userPlaces = signal<Place[]>([]);
  private erroService = inject(ErrorService);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Something went wrong on fetching places.'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Something went wrong on fetching your favorite places.'
    ).pipe(
      tap({
        // tapはSubscribeなしで動かせるようにするもの。
        // UserPlacesをバックエンドから取得し、読みより専用のUserPlacesに格納。
        next: (userPlaces) => this.userPlaces.set(userPlaces),
      })
    );
  }

  addPlaceToUserPlaces(addedPlace: Place) {
    const prevPlaces = this.userPlaces();

    if (!prevPlaces.some((place) => place.id === addedPlace.id)) {
      this.userPlaces.set([...prevPlaces, addedPlace]);
    }

    return this.httpClient
      .put('http://localhost:3000/user-places', {
        placeId: addedPlace.id,
      })
      .pipe(
        catchError((error) => {
          this.userPlaces.set(prevPlaces); // エラーが発生したら、UserPlaceをaddedPlace追加前の状態に戻す。
          this.erroService.showError('Failed to store selected place');
          return throwError(() => new Error('Failed to store selected place'));
        })
      );
  }

  removeUserPlace(place: Place) {
    console.log(`deleting: ${place.id}`);
    const prevPlaces = this.userPlaces();

    if (prevPlaces.some((place) => place.id === place.id)) {
      this.userPlaces.set(prevPlaces.filter((p) => p.id !== place.id));
    }
    return this.httpClient
      .delete(`http://localhost:3000/user-places/` + place.id)
      .pipe(
        catchError((err) => {
          this.erroService.showError(`Failed to delete the place, ${err}`);
          return throwError(
            () => new Error(`Failed to delete the place, ${err}`)
          );
        })
      );
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      map((resData) => resData.places),
      catchError((err) => {
        console.log(err);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
