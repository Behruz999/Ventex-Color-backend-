// Ventex-Color

const schema = {
  // slayder (home page)
  sliders: {
    title: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    desc: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    photo: String,
    active: Boolean, // default: false
  },

  // biz haqimizda
  abouts: {
    content: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    active: Boolean, // default: false
  },

  // kataloglar
  product_categories: {
    title: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    photo: String,
    active: Boolean, // default: false
  },

  // mahsulotlar
  products: {
    title: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    desc: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    features: [
      {
        UZL: String,
        RUS: String,
        ENG: String,
      },
    ], // xususiyatlari
    category_id: Number,
    active: Boolean, // default: false
  },

  // qoplamalar
  coatings: {
    title: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    photo: String,
    active: Boolean, // default: false
  },

  product_photos: {
    product_id: Number,
    coating_id: Number,
    photos: [String],
    active: Boolean, // default: false
  },

  // xizmatlar (sizga taklif qilamiz)
  services: {
    title: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    desc: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    photo: String,
    active: Boolean, // default: false
  },

  // yangiliklar
  news: {
    title: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    content: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    date: String,
    active: Boolean, // default: false
  },

  // mijozlar fikri
  client_opinions: {
    full_name: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    text: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    photo: String,
    active: Boolean, // default: false
  },

  // bog'lanish
  contacts: {
    title: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    desc: {
      UZL: String,
      RUS: String,
      ENG: String,
    },
    phones: [String],
    email: String,
    address: {
      UZL: String,
      RUS: String,
      ENG: String,
    }, // manzil
    location: {
      lat: Number,
      lng: Number,
    },
    photo: String,

    brand_title: {
      UZL: String,
      RUS: String,
      ENG: String,
    }, // sayt nomi (optional)
    logo: String,
    active: Boolean, // default: false
  },

  // ijtimoiy-tarmoqlar
  social_networks: {
    telegram: String,
    instagram: String,
    facebook: String,
    youtube: String,
    active: Boolean, // default: false
  },

  // konsultatsiya so'rovlari (Bepul konsultatsiya oling!)
  consultation_requests: {
    full_name: String,
    phone: String,
    text: String,
    date: String,
    status: Number, // 1 > yangi, 2 > ko'rib chiqilgan
    active: Boolean, // default: false
  },

  // hamkorlar (Bizning hamkorlar)
  our_partners: {
    link: String,
    photo: String,
    active: Boolean, // default: false
  },

  // // foto-galareyalar
  // photo_medias: {
  //   photo: String,
  //   date: String,
  //   active: Boolean, // default: false
  // },

  // // video-galareyalar
  // video_medias: {
  //   link: String, // video linki
  //   date: String,
  //   active: Boolean, // default: false
  // },

  // rasm/fayl lar ma'lumotlari (html content ichiga qo'yiladigan rasm)
  file_metadatas: {
    path: String,
    date: String, // YYYY-MM-DD HH:mm
  },

  // xodimlar (admin, manager, ...)
  users: {
    first_name: String,
    last_name: String,
    phone: String,
    role: String,
    login: String,
    password: String, // shifrlanadi
  },
};
