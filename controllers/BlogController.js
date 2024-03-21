import BlogModel from '../model/Blog.js';

export const getLastTags = async (req, res) => {
  try {
    const Blogs = await BlogModel.find().limit(5).exec();

    const tags = Blogs
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Unable to get tags',
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const Blogs = await BlogModel.find().populate('user').exec();
    res.json(Blogs);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Unable to get tags',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const BlogId = req.params.id;

    BlogModel.findOneAndUpdate(
      {
        _id: BlogId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Unable to get blog',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      },
    ).populate('user');
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Unable to get tags',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const BlogId = req.params.id;

    BlogModel.findOneAndDelete(
      {
        _id: BlogId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Unable to remove blog',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Blog not found',
          });
        }

        res.json({
          success: true,
        });
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Unable to get tags',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new BlogModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.user.id,
    });

    const Blog = await doc.save();

    res.json(Blog);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Unable to create blog',
    });
  }
};

export const update = async (req, res) => {
  try {
    const BlogId = req.params.id;

    await BlogModel.updateOne(
      {
        _id: BlogId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.user._id,
        tags: req.body.tags.split(','),
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Unable to update blog',
    });
  }
};