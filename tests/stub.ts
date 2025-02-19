import mongoose from 'mongoose';

export const stub_recipe_1 = {
    "_id": "6683b8d38475eac9af5fe838",
    "owner": {
        "_id": "6687d83725254486590fec59",
        "name": "user_1",
        "image": "https://user1.img.link"
    },
    "name": "Recipe_1_name",
    "ingredients": [
        {
            "name": "Recipe_1_Ingredient_1",
            "quantity": "Recipe_1_Ingredient_1_quantity_1",
            "_id": "6683b8d38475eac9af5fe839"
        },
        {
            "name": "Recipe_1_Ingredient_2",
            "quantity": "Recipe_1_Ingredient_2_quantity_2",
            "_id": "6683b8d38475eac9af5fe83a"
        },
    ],
    "instructions": [
        "Recipe_1_Instructions_1.",
        "Recipe_1_Instructions_2.",
    ],
    "dietaryPreference": [
        "Recipe_1_preference_1",
        "Recipe_1_preference_2"
    ],
    "additionalInformation": {
        "tips": "Recipe_1_tips",
        "variations": "Recipe_1_variations",
        "servingSuggestions": "Recipe_1_servingSuggestions",
        "nutritionalInformation": "Recipe_1_nutritionalInformation"
    },
    "imgLink": "https://smart-recipe-generator.s3.amazonaws.com/Recipe_1",
    "openaiPromptId": "6683b8908475eac9af5fe834",
    "likedBy": [
        {
            "_id": "668550b989b50bfdbcc56198",
            "name": "user_2",
            "image": "https://user2.img.link",
        },
    ],
    "comments": [],
    "tags": [{ tag: 'specialtag', _id: 'stub_tag_id' }],
    "createdAt": "2024-07-02T08:22:43.168Z",
    "updatedAt": "2024-07-06T15:13:00.968Z",
    "__v": 0,
    "owns": true,
    "liked": false
}

const stub_recipe_2 = {
    "_id": "6683b8d38475eac9af5fe83d",
    "owner": {
        "_id": "668550b989b50bfdbcc56198",
        "name": "user_2",
        "image": "https://user2.img.link",
    },
    "name": "Recipe_2_name",
    "ingredients": [
        {
            "name": "Recipe_2_Ingredient_1",
            "quantity": "Recipe_2_Ingredient_1_quantity_1",
            "_id": "6683b8d38475eac9af5fe840"
        },
        {
            "name": "Recipe_2_Ingredient_2",
            "quantity": "Recipe_2_Ingredient_2_quantity_2",
            "_id": "6683b8d38475eac9af5fe83c"
        },
    ],
    "instructions": [
        "Recipe_2_Instructions_1.",
        "Recipe_2_Instructions_2.",
    ],
    "dietaryPreference": [
        "Recipe_2_preference_1",
        "Recipe_2_preference_2"
    ],
    "additionalInformation": {
        "tips": "Recipe_2_tips",
        "variations": "Recipe_2_variations",
        "servingSuggestions": "Recipe_2_servingSuggestions",
        "nutritionalInformation": "Recipe_2_nutritionalInformation"
    },
    "imgLink": "https://smart-recipe-generator.s3.amazonaws.com/Recipe_2",
    "openaiPromptId": "6683b8908475eac9af5fe836",
    "likedBy": [
        {
            "_id": "6687d83725254486590fec59",
            "name": "user_1",
            "image": "https://user1.img.link"
        }
    ],
    "comments": [],
    "tags": [],
    "createdAt": "2024-07-02T08:22:43.168Z",
    "updatedAt": "2024-07-06T15:13:00.968Z",
    "__v": 0,
    "owns": false,
    "liked": true
}

export const ingredientListStub = [
    {
        "_id": "668c1011cd79a2aa4b426731",
        "name": "Test-Ingredient-1",
        "createdBy": null,
        "createdAt": "2024-07-08T16:13:05.549Z",
        "updatedAt": "2024-07-08T16:13:05.549Z",
    },
    {
        "_id": "668c1011cd79a2aa4b426931",
        "name": "Test-Ingredient-2",
        "createdBy": null,
        "createdAt": "2024-07-08T16:13:05.549Z",
        "updatedAt": "2024-07-08T16:13:05.549Z",
    },
    {
        "_id": "668c1011cd79a2aa4b426932",
        "name": "Test-Ingredient-3",
        "createdBy": null,
        "createdAt": "2024-07-08T16:13:05.549Z",
        "updatedAt": "2024-07-08T16:13:05.549Z",
    }
]

export const getServerSessionStub = {
    user: {
        id: '6687d83725254486590fec59',
        name: 'user_name'
    },
    expires: 'some time'
}

export const stubRecipeBatch = [stub_recipe_1, stub_recipe_2]

export const stubNotifications = [
    {
        _id: 'stub_id_1',
        userId: '6687d83725254486590fec59' as any,
        initiatorId: '6687d83725254486590fec54' as any,
        type: 'like' as any,
        recipeId: 'stub_recipe_id' as any,
        message: 'stub_message_1',
        read: false,
        createdAt: '',
        updatedAt: ''
    }
]