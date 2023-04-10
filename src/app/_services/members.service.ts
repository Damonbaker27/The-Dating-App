import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, of } from 'rxjs';
import { Environment } from '../enviorments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { User } from '../_models/user';
import { userParams } from '../_models/userParams';

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  baseUrl = Environment.apiUrl;
  members: Member[] = [];
  paginatedResult: PaginatedResult<Member[]> = new PaginatedResult<Member[]>;

  constructor(private http :HttpClient) {}

  getMembers(userParams: userParams){

    let queryParams = new HttpParams();

    //add pagination information to params
    queryParams = this.getParams(userParams, queryParams);

    return this.http.get<Member[]>(this.baseUrl + 'users', { observe: 'response', params: queryParams }).pipe(
      map(response =>{

        //set result to response body containing members.
        if(response.body){
          this.paginatedResult.result = response.body
        }

        //retrive the pagination header
        const pagination = response.headers.get('Pagination')

        if(pagination){
          //turn the json header into an object
          this.paginatedResult.pagination = JSON.parse(pagination)
        }

        return this.paginatedResult;
      })

    )

  }

  private getParams(userParams: userParams, queryParams: HttpParams) {
    if (userParams.pageNumber && userParams.pageSize) {
      queryParams = queryParams.append('pageNumber', userParams.pageNumber);
      queryParams = queryParams.append('pageSize', userParams.pageSize);
      queryParams = queryParams.append('minAge', userParams.minAge);
      queryParams = queryParams.append('maxAge', userParams.maxAge);
      queryParams = queryParams.append('gender', userParams.gender);
    }
    return queryParams;
  }

  getMember(username: string){
    const member = this.members.find(x => x.userName == username);
    if(member){
      return of(member);
    }

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member){
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() =>{
        //get index of member to be updated in array
        const index = this.members.indexOf(member);
        // update the cached members array during update.
        this.members[index] = {...this.members[index],...member}
      })
    )
  }

  setMainPhoto(photoId :number){
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }


  deletePhoto(photoId: number){
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }



}
