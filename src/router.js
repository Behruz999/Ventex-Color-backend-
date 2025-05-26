const router = require("express").Router();
const AdminRouter = require("./routes/admin.router");
const AuthRouter = require("./routes/auth.router");
const AboutRouter = require("./routes/about.router");
const ClientOpinionRouter = require("./routes/clientOpinion.router");
const CoatingRouter = require("./routes/coating.router");
const ConsultationRequestRouter = require("./routes/consultationRequest.router");
const ContactRouter = require("./routes/contact.router");
const FileMetadataRouter = require("./routes/fileMetadata.router");
const NewsRouter = require("./routes/news.router");
const OurPartnerRouter = require("./routes/ourPartner.router");
const PhotoMediaRouter = require("./routes/photoMedia.router");
const ProductRouter = require("./routes/product.router");
const ProductCategoryRouter = require("./routes/productCategory.router");
const ProductPhotoRouter = require("./routes/productPhoto.router");
const ServiceRouter = require("./routes/service.router");
const SliderRouter = require("./routes/slider.router");
const SocialNetworkRouter = require("./routes/socialNetwork.router");
const UserRouter = require("./routes/user.router");
const VideoMediaRouter = require("./routes/videoMedia.router");
const DeleteFileRouter = require("./routes/deleteFile.router");

const TelegramFileRouter = require("./routes/telegramFile");

// ---------web-----------------
const WebAboutRouter = require("./webRoutes/about.router");
const WebClientOpinionRouter = require("./webRoutes/clientOpinion.router");
const WebConsultationRequestRouter = require("./webRoutes/consultationRequest.router");
const WebContactRouter = require("./webRoutes/contact.router");
const WebNewsRouter = require("./webRoutes/news.router");
const WebOurPartnerRouter = require("./webRoutes/ourPartner.router");
const WebPhotoMediaRouter = require("./webRoutes/photoMedia.router");
const WebProductRouter = require("./webRoutes/product.router");
// const WebProductCategoryRouter = require("./webRoutes/productCategory.router");
// const WebProductPhotoRouter = require("./webRoutes/productSubPhoto.router");
const WebServiceRouter = require("./webRoutes/service.router");
const WebSliderRouter = require("./webRoutes/slider.router");
const WebSocialNetworkRouter = require("./webRoutes/socialNetwork.router");
const WebVideoMediaRouter = require("./webRoutes/videoMedia.router");

// ---------admin-panel-----------------
router.use("/admin", AdminRouter);
router.use("/auth", AuthRouter);
router.use("/abouts", AboutRouter);
router.use("/client-opinions", ClientOpinionRouter);
router.use("/coatings", CoatingRouter);
router.use("/consultation-requests", ConsultationRequestRouter);
router.use("/contacts", ContactRouter);
router.use("/file-metadatas", FileMetadataRouter);
router.use("/news", NewsRouter);
router.use("/our-partners", OurPartnerRouter);
router.use("/photo-medias", PhotoMediaRouter);
router.use("/products", ProductRouter);
router.use("/product-categories", ProductCategoryRouter);
router.use("/product-photos", ProductPhotoRouter);
router.use("/services", ServiceRouter);
router.use("/sliders", SliderRouter);
router.use("/social-networks", SocialNetworkRouter);
router.use("/users", UserRouter);
router.use("/video-medias", VideoMediaRouter);

router.use("/delete-files", DeleteFileRouter);
router.use("/tg", TelegramFileRouter);

// ---------web-----------------
router.use("/web/abouts", WebAboutRouter);
router.use("/web/client-opinions", WebClientOpinionRouter);
router.use("/web/consultation-requests", WebConsultationRequestRouter);
router.use("/web/contacts", WebContactRouter);
router.use("/web/news", WebNewsRouter);
router.use("/web/our-partners", WebOurPartnerRouter);
router.use("/web/photo-medias", WebPhotoMediaRouter);
router.use("/web/products", WebProductRouter);
// router.use("/web/product-categories", WebProductCategoryRouter);
// router.use("/web/product-photos", WebProductPhotoRouter);
router.use("/web/services", WebServiceRouter);
router.use("/web/sliders", WebSliderRouter);
router.use("/web/social-networks", WebSocialNetworkRouter);
router.use("/web/video-medias", WebVideoMediaRouter);

module.exports = router;
