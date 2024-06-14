import asyncHandler from "express-async-handler";
import linksModel from "../models/linksModel.js";
import cloudinary from "../utils/cloudinaryConfig.js";
import * as cheerio from "cheerio";
import axios from "axios";

// @desc    Get links
// @route   GET /api/links
// @access  Private
const getLinks = asyncHandler(async (req, res) => {
  const links = await linksModel.find({ user: req.user.id }).sort({ order: 1 });

  if (links) {
    res.status(200).json(links);
  } else {
    res.status(500).json(req.user);
  }
});

// @desc    Set link
// @route   POST /api/links
// @access  Private
const setLink = asyncHandler(async (req, res) => {
  const { title, url } = req.body;

  if (!req.body.url) {
    res.status(400);
    throw new Error("Please add a url field");
  }
  try {
    const response = await axios.get(url);
    const html = response && (await response.data);
    const $ = cheerio.load(html);
    const UrlTitle = $("title").text();

    const link = await linksModel.create({
      title:
        (title === null || title === undefined || title === "") && UrlTitle
          ? UrlTitle
          : "",
      url,
      user: req.user.id,
    });
    res.status(200).json(link);
  } catch (error) {
    res.status(500).json({ message: "link could not be created" });
  }
});

const updateLinks = asyncHandler(async (req, res) => {
  const { link_id } = req.params;
  const { title, url, show } = req.body;

  try {
    const link = await linksModel.findOne({ _id: link_id });

    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    if (link.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this link" });
    }

    // Link'i güncelle
    link.title = title ?? link.title;
    link.url = url ?? link.url;
    if (typeof show !== "undefined") {
      link.show = show;
    }

    const updatedLink = await link.save();
    res.status(200).json(updatedLink);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const addThumbnail = asyncHandler(async (req, res) => {
  const { link_id } = req.params;
  console.log(link_id);
  const { thumbnail_image } = req.body;
  try {
    const result = await cloudinary.uploader.upload(thumbnail_image, {
      use_filename: true,
      folder: "social",
    });

    const link = await linksModel.findOne({ _id: link_id });

    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    if (link.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this link" });
    }

    // Link'i güncelle
    link.thumbnail_image = result.secure_url ?? link.thumbnail_image;

    const updatedLink = await link.save();

    res.status(200).json(updatedLink);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const deleteLink = asyncHandler(async (req, res) => {
  const { link_id } = req.params;

  try {
    const link = await linksModel.findOne({ _id: link_id });

    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    // Check if the user from the token is the owner of the link
    if (link.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this link" });
    }

    await link.deleteOne();
    res.status(200).json({ message: "Link removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const updateOrder = asyncHandler(async (req, res) => {
  const { orderArray } = req.body;
  console.log(orderArray);
  for (let i = 0; i < orderArray.length; i++) {
    const links = await linksModel.findOneAndUpdate(
      {
        user: req.user.id,
        _id: orderArray[i]._id,
      },
      { order: i + 1 },
      {
        new: true,
      }
    );
    console.log(links);
  }
  res.status(200).json(linksModel);
});

export {
  setLink,
  getLinks,
  updateOrder,
  updateLinks,
  addThumbnail,
  deleteLink,
};
