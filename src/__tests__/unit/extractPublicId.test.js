import { describe, it, expect } from "@jest/globals";

const extractPublicId = (cloudinaryUrl) => {
  const parts = cloudinaryUrl.split("/");
  const filename = parts[parts.length - 1].split(".")[0];
  const folder = parts[parts.length - 2];
  return folder.startsWith("v") ? filename : `${folder}/${filename}`;
};

describe("extractPublicId Helper", () => {

  it("should extract publicId from cloudinary URL with folder", () => {
    const url = "https://res.cloudinary.com/demo/image/upload/myfolder/myimage.jpg";
    const result = extractPublicId(url);
    expect(result).toBe("myfolder/myimage");
  });

  it("should extract publicId from cloudinary URL without folder", () => {
    const url = "https://res.cloudinary.com/demo/image/upload/v1234567/myimage.jpg";
    const result = extractPublicId(url);
    expect(result).toBe("myimage");
  });

  it("should remove file extension", () => {
    const url = "https://res.cloudinary.com/demo/video/upload/myfolder/myvideo.mp4";
    const result = extractPublicId(url);
    expect(result).not.toContain(".mp4");
  });

  it("should handle png extension", () => {
    const url = "https://res.cloudinary.com/demo/image/upload/myfolder/thumb.png";
    const result = extractPublicId(url);
    expect(result).toBe("myfolder/thumb");
  });

});