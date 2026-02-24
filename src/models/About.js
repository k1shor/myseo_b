import mongoose from "mongoose";

const MetaSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: String, default: "" },
    canonical: { type: String, default: "/about" },
    og: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      image: { type: String, default: "" },
      type: { type: String, default: "website" }
    },
    twitter: {
      card: { type: String, default: "summary_large_image" },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      image: { type: String, default: "" }
    }
  },
  { _id: false }
);

const StatSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const FeatureCardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const ExpertiseItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    desc: { type: String, default: "" }
  },
  { _id: false }
);

const AboutSchema = new mongoose.Schema(
  {
    // 🔑 Single document pattern
    key: { type: String, unique: true, default: "default", index: true },

    meta: { type: MetaSchema, default: () => ({}) },

    page: {
      title: { type: String, default: "About" },
      kicker: { type: String, default: "OUR STORY" }
    },

    content: {
      intro: {
        lead: { type: String, default: "" },
        emphasisA: { type: String, default: "" },
        mid: { type: String, default: "" },
        emphasisB: { type: String, default: "" },
        tail: { type: String, default: "" }
      },

      featureCards: { type: [FeatureCardSchema], default: [] },

      founder: {
        heading: { type: String, default: "" },
        quote: { type: String, default: "" },
        sign: { type: String, default: "" }
      },

      whatYouGet: {
        heading: { type: String, default: "" },
        items: { type: [String], default: [] }
      },

      expertise: {
        heading: { type: String, default: "Expertise" },
        subtitle: { type: String, default: "" },
        items: { type: [ExpertiseItemSchema], default: [] }
      },

      heroBadges: {
        badgeText: { type: String, default: "" },
        name: { type: String, default: "" }
      },

      stats: { type: [StatSchema], default: [] }
    },

    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const About = mongoose.model("About", AboutSchema);

export default About;