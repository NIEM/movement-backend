FORMAT: 1A

# Example Documentation
An example of API documentation using [API Blueprint](https://apiblueprint.org).

#Group My Application

## Thingamajigs [/example/{_id}]

### Retrieve a list of Thingamajigs [GET]

+ Response 200 (application/json)
    + Body

            [{
              "_id": "58209f22dd0707323f0f092e",
              "createdAt": "2016-11-07T15:34:58.772Z",
              "updatedAt": "2016-11-07T15:34:58.772Z",
              "title": "foo",
              "description": "bar",
              "date": "2016-11-07T15:34:58.760Z"
            }]


### Create a Thingamajig [POST]

| Property | Type | Description |
|----------|------|-------------|
| title | String | Title of the thing |
| description | String | Description of the thing |
| date | Datetime | Date of the thing |

+ Request (application/json)

            {
              "title": "New Title",
              "description": "Lorem Ipsum",
              "date": "2016-11-11T00:00:00Z"
            }

+ Response 201

### Update a Thingamajigs [PUT]
+ Parameters

  + _id: 58209f22dd0707323f0f092e (string) - An unique identifier of the thing.

+ Request (application/json)

            {
              "title": "New Title",
              "description": "Lorem Ipsum",
              "date": "2016-11-11T00:00:00Z"
            }

+ Response 200
+ Response 404

### Remove a Thingamajigs [DELETE]
+ Parameters

  + _id: 58209f22dd0707323f0f092e (string) - An unique identifier of the thing.

+ Response 200
