WidgetMetadata = {
  id: "gayVideo",
  title: "gayVideo",
  description: "获取 gayVideo 视频",
  author: "xxx",
  site: "https://github.com/quantumultxx/FW-Widgets",
  version: "1.0.2",
  requiredVersion: "0.0.1",
  detailCacheDuration: 60,
  modules: [
    {
      title: "浏览视频",
      functionName: "loadList",
      type: "video",
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "category",
          title: "分类",
          type: "enumeration",
          value: "new",
          enumOptions: [
            { title: "中国", value: "chinese" },
            { title: "台湾", value: "taiwanese" },
            { title: "亚洲", value: "asian" },
            { title: "日本", value: "japanese" },
            { title: "韩国", value: "korean" },
            { title: "泰国", value: "thai" },
            { title: "越南", value: "vietnamese" },
            { title: "泰国高清", value: "thai-hd" },
            { title: "亚洲按摩", value: "asian-massage" },
            { title: "中国自制", value: "chinese-homemade" },
            { title: "亚洲帅哥", value: "asian-hunk" },
            { title: "中国人高清", value: "chinese-hd" },
            { title: "剧情", value: "story" },
            { title: "twink", value: "twink" },
            { title: "中国自制", value: "chinese-homemade" },
            { title: "亚洲帅哥", value: "asian-hunk" },
            { title: "中国人高清", value: "chinese-hd" }
          ]
        },
        {
          name: "advertiser_publish_date",
          title: "已添加日期",
          type: "enumeration",
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "过去24小时", value: "1D" },
            { title: "过去两天", value: "2D" },
            { title: "过去一周", value: "7D" },
            { title: "过去一个月", value: "1M" },
            { title: "过去三个月", value: "3M" },
            { title: "过去一年", value: "1Y" }
          ]
        },
        {
          name: "duration",
          title: "排序",
          type: "enumeration",
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "1+分钟", value: "60" },
            { title: "5+分钟", value: "300" },
            { title: "10+分钟", value: "600" },
            { title: "20+分钟", value: "1200" },
            { title: "30+分钟", value: "1800" },
            { title: "60+分钟", value: "3600" },
            { title: "0-10分钟", value: "0-600" },
            { title: "0-20分钟", value: "0-1200" }
          ]
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          value: "popular",
          enumOptions: [
            { title: "人气", value: "popular" },
            { title: "日期", value: "date" },
            { title: "持续时间", value: "duration" },
            { title: "评分", value: "rating" }
          ]
        }
      ]
    }
  ],
};

const BASE_URL = "https://www.gaymaletube.com";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
};

async function loadList(params = {}) {
  const { page = 1, category = "chinese", advertiser_publish_date = "", duration = "", sort = "popular" } = params;

  const qs = `filter%5Badvertiser_publish_date%5D=${advertiser_publish_date}&filter%5Bduration%5D=${duration}&filter%5Bquality%5D=&filter%5Bvirtual_reality%5D=&filter%5Badvertiser_site%5D=&filter%5Border_by%5D=${sort}`;

  let url = `${BASE_URL}/zh/cat/${category}?${qs}`;
  if (page > 1) url += `&page=${page}`;

  try {
    const res = await Widget.http.get(url, { headers: HEADERS });
    const html = res.data;

    if (!html) {
      return [{ id: "err", type: "text", title: "无返回内容" }];
    }

    const $ = Widget.html.load(html);
    const results = [];

    $(".cards-container .card").each((i, el) => {
      const $el = $(el);

      const $link = $el.find("a.item-link").first();
      const href = $link.attr("href");
      if (!href) return;

      const title =
        $el.find("a.item-title").first().text().trim() ||
        $link.attr("title") ||
        "";

      const imgSrc =
        $el.find("img.item-image").attr("src") ||
        $el.find("img.item-image").attr("data-src") ||
        "";

      // 时长在右下角 badge 里，可能包含“HD”，这里只取文本并去空格
      const duration = $el
        .find(".item-meta-container .badge")
        .first()
        .text()
        .replace(/\s+/g, " ")
        .trim();

      results.push({
        id: href,
        type: "link",
        title: title || "未命名",
        coverUrl: imgSrc,
        link: href,
        description: duration ? `时长: ${duration}` : "",
        customHeaders: HEADERS
      });
    });

    return results;
  } catch (e) {
    return [{ id: "err", type: "text", title: "加载失败", subTitle: e.message }];
  }
}

// async function loadDetail(link) {
//   const response = await Widget.http.get(link, {
//     headers: {
//       "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
//     },
//   });
//   const hlsUrl = response.data.match(/var hlsUrl = '(.*?)';/)[1];
//   if (!hlsUrl) {
//     throw new Error("无法获取有效的HLS URL");
//   }
//   const item = {
//     id: link,
//     type: "detail",
//     videoUrl: hlsUrl,
//     mediaType: "movie",
//     playerType: "system",
//     customHeaders: {
//       "Referer": link,
//       "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
//     },
//   };
//   const sections = await parseHtml(response.data);
//   const items = sections.flatMap((section) => section.childItems);
//   if (items.length > 0) {
//     item.childItems = items;
//   }
//   return item;
// }

// 辅助函数：处理 URL 拼接
function resolveUrl(url) {
  if (url.startsWith("http")) return url;
  // 处理相对路径，确保基于 BASE_URL 的根域名
  try {
    const baseUrlObj = new URL(BASE_URL);
    return new URL(url, baseUrlObj.origin).href;
  } catch (e) {
    return url;
  }
}

async function loadDetail(link) {
  // 1. 拼接完整 URL
  // const url = resolveUrl(link);
  const url = BASE_URL + link; // 直接拼接，避免解析错误导致的路径问题

  console.log(`Loading detail from URL: ${url}`);
  try {
    // 2. 发起请求 (Widget.http 默认会自动跟随重定向到目标网站)
    const res = await Widget.http.get(url, { headers: HEADERS });
    const html = res.data;
    const $ = Widget.html.load(html);

    // 3. 获取基础信息 (尝试从 OpenGraph 标签或 Title 获取)
    let title = $('meta[property="og:title"]').attr('content') || $("title").text().trim();
    let coverUrl = $('meta[property="og:image"]').attr('content');

    console.log(`Parsed title: ${title}`);
    console.log(`Parsed cover URL: ${coverUrl}`);
    
    // 4. 通用视频地址嗅探 (逻辑参考 MISSAV)
    let videoUrl = "";

    // 策略 A: 查找 <source> 标签
    $("video source").each((i, el) => {
      const src = $(el).attr("src");
      if (src && (src.includes(".m3u8") || src.includes(".mp4"))) {
        videoUrl = src;
        return false; // break
      }
    });

    // 策略 B: 查找脚本中的 .m3u8 链接 (适用于大多数 HLS 站点)
    if (!videoUrl) {
      // 匹配 http 开头，.m3u8 结尾的字符串
      const m3u8Regex = /https?:\/\/[^"'\s<>]+\.m3u8/gi;
      const matches = html.match(m3u8Regex);
      if (matches && matches.length > 0) {
        // 通常第一个是主播放列表
        videoUrl = matches[0];
      }
    }

    // 策略 C: 查找脚本中的 .mp4 链接
    if (!videoUrl) {
      const mp4Regex = /https?:\/\/[^"'\s<>]+\.mp4/gi;
      const matches = html.match(mp4Regex);
      if (matches && matches.length > 0) {
        videoUrl = matches[0];
      }
    }

    // 5. 返回结果
    if (videoUrl) {
      // 修复 URL 中的转义字符 (如果有)
      videoUrl = videoUrl.replace(/\\/g, "");

      return [{
        id: link,
        type: "url", // 使用标准类型，部分内核也支持 "video"
        title: title || "未知标题",
        coverUrl: coverUrl,
        videoUrl: videoUrl,
        playerType: "system", // 使用系统播放器播放 m3u8/mp4
        headers: {
          "User-Agent": HEADERS["User-Agent"],
          // 部分站点可能需要 Referer
          "Referer": url
        }
      }];
    } else {
      // 如果找不到视频，尝试返回 Webview 模式或报错
      return [{
        id: "err",
        type: "text",
        title: "解析失败",
        subTitle: "未找到视频地址，目标站点可能使用了加密或不支持的格式。",
        description: `目标链接: ${url}`
      }];
    }

  } catch (e) {
    return [{ id: "err", type: "text", title: "加载详情失败", subTitle: e.message }];
  }
}
