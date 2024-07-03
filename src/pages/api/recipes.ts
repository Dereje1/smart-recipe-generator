import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../lib/models/recipe';
import { ExtendedRecipe } from '../../types';

const filterResults = (recipes: ExtendedRecipe[]) => {
  return recipes.map((recipe)=> (
    {
      ...recipe,
      owner:{
        _id: recipe.owner._id,
        name: recipe.owner.name
      }
    }
  ))
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  try {
    const allRecipes = await Recipe.find()
    .populate(['owner', 'likedBy', 'comments.user'])
    .lean()
    .exec() as unknown as ExtendedRecipe[]

    res.status(200).json(filterResults(allRecipes));
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

export default handler;
