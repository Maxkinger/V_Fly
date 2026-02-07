WidgetMetadata = {
  id: "gayVideo",
  title: "video",
  description: "获取Video 视频",
  author: "xxx",
  site: "https://github.com/quantumultxx/FW-Widgets",
  version: "0.0.20",
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
    },
    {
      title: "获取视频详情",
      functionName: "loadDetail2",
      params: [
        {
          name: "adre",
          title: "url地址",
          type: "input",
          placeholder: "请输入视频详情页的URL地址"
        },
      ]
    }
  ]
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
  console.log(`Constructed URL: ${url}`);

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

async function loadDetail(link) {
  // 1. 拼接完整 URL
  // const url = BASE_URL + link; // 直接拼接，避免解析错误导致的路径问题
  let url = `${BASE_URL}${link}`;

  console.log(`Loading detail from URL: ${url}`);
  try {
    // 2. 发起请求 (Widget.http 默认会自动跟随重定向到目标网站)
    const res = await Widget.http.get(url, { headers: HEADERS });
    const html = res.data;

    console.log(`Detail page loaded, parsing content...: ${html}`);

    const $ = Widget.html.load(html);

    // 3. 获取基础信息 (尝试从 OpenGraph 标签或 Title 获取)
    let title = $('meta[property="og:title"]').attr('content') || $("title").text().trim();
    let coverUrl = $('meta[property="og:image"]').attr('content');

    console.log(`Parsed title: ${title}`);
    console.log(`Parsed cover URL: ${coverUrl}`);

    // 4. 通用视频地址嗅探 (逻辑参考 MISSAV)
    let videoUrl = "";

    const multiMatch = html.match(/var\s+multiSource\s*=\s*'([^']+)';/);
    if (multiMatch && multiMatch[1]) {
      videoUrl = multiMatch[1];
      // console.log("Found master playlist (multiSource)");
    }
    // 继续尝试其他策略，如果 multiSource 未找到或无效
    // 1. 提取 sources 数组 (最关键的一步)
    // 正则含义：匹配 "var sources =" 后面直到 ";" 之前的所有内容
    if (!videoUrl) {
      const sourcesMatch = html.match(/var\s+sources\s*=\s*(\[.*?\]);/s);
      console.log(`Sources match: ${sourcesMatch}`);

      if (sourcesMatch && sourcesMatch[1]) {
        try {
          // 解析 JSON
          const sources = JSON.parse(sourcesMatch[1]);

          console.log(`Parsed sources: ${sources}`);

          // 2. 挑选最佳画质
          // 策略：优先找 desc 为 "720p" 或 "1080p" 的，找不到就拿第一个
          let bestSource = sources.find(s => s.desc === "1080p") ||
            sources.find(s => s.desc === "720p") ||
            sources[0];

          if (bestSource && bestSource.src) {
            videoUrl = bestSource.src;
          }
          console.log(`Selected video URL: ${videoUrl}`);
        } catch (e) {
          console.log("解析 sources JSON 失败: " + e.message);
        }
      }
    }


    // 【策略 2】 直接 Video 标签模式 (新增：对应 gay4porn 等)
    // 说明：很多网站直接把地址写在 <video src="..."> 里
    if (!videoUrl) {
      // 优先找带 fp-engine 类的 (你提供的例子)，或者任意带 src 的 video 标签
      const $video = $('video.fp-engine').first();
      let src = $video.attr('src');

      // 如果没找到 fp-engine，尝试找任意有 src 的 video
      if (!src) {
        src = $('video[src]').attr('src');
      }

      if (src && src.startsWith('http')) {
        videoUrl = src;
      }
    }

    // 【策略 3】 通用正则暴力搜索 (兜底)
    // 应对那些既没有 video 标签，也没有明显 sources 变量的网站
    if (!videoUrl) {
      // 找 m3u8
      const m3u8Match = html.match(/https?:\/\/[^"'\s<>]+\.m3u8/i);
      if (m3u8Match) videoUrl = m3u8Match[0];

      // 找 mp4 (如果还没找到)
      if (!videoUrl) {
        const mp4Match = html.match(/https?:\/\/[^"'\s<>]+\.mp4/i);
        if (mp4Match) videoUrl = mp4Match[0];
      }
    }

    if (videoUrl) {
      let videoHeaders = {
        "Referer": BASE_URL, // 必须是根域名，不能是 link
        "User-Agent": HEADERS["User-Agent"]
      };

      if (videoUrl.includes("boyfriendtv.com")) {
        videoHeaders["Referer"] = "https://www.boyfriendtv.com/";
      } else if (videoUrl.includes("gaydudesfucking.com")) {
        videoHeaders["Referer"] = "https://www.gaydudesfucking.com/";
      } else if (videoUrl.includes("gay4porn.com")) {
        videoHeaders["Referer"] = "https://www.gay4porn.com/";
      }

      console.log(`Final video URL: ${videoUrl}`);

      return [{
        id: link,
        type: "video",
        title: title,
        videoUrl: videoUrl,
        playerType: "system",
        customHeaders: videoHeaders
      }];
    } else {
      return [{ id: "err", type: "text", title: "解析失败", subTitle: "未找到播放地址" }];
    }

  } catch (e) {
    return [{ id: "err", type: "text", title: "加载详情失败", subTitle: e.message }];
  }
}

async function loadDetail2(link) {
  // 1. 拼接完整 URL
  let link111 = "/out/?l=3AASGc4RmGQCq2pRc0x6R3pwdzVNAtlYaHR0cHM6Ly93d3cuZ2F5NHBvcm4uY29tL3ZpZGVvcy8yNjgzNy9jaGluZXNlLXBsdW1iZXItZnVjay1mZXN0LXBhcnQtMS8/dXRtX3NvdXJjZT1wYndlYs0DDqJ0YwHNB4incG9wdWxhcg/ZK3siYWxsIjoiIiwib3JpZW50YXRpb24iOiJnYXkiLCJwcmljaW5nIjoiIn3M/M5phx%2BaqGNhdGVnb3J5zXbSwNl8W3siMSI6IkxicUhzYWo0QVRKIn0seyIyIjoibzRZM0h5TkppRTYifSx7IjMiOiJ2OXJmb2JydGVKYiJ9LHsiLTEiOiJCVkdweHpHMW9LRiJ9LHsiLTIiOiJRWXA5WjE1alAzSCJ9LHsiLTMiOiI3U0N5UkhQS2dqbCJ9XQ%3D%3D&c=26558940&v=3&"

  const { adre } = params;
  if (!adre || adre.trim() === "") {
    return [];
  }
  link111 = adre.trim();

  // const url = BASE_URL + link; // 直接拼接，避免解析错误导致的路径问题
  let url = `${BASE_URL}${link111}`;

  console.log(`Loading detail from URL: ${url}`);
  try {
    // 2. 发起请求 (Widget.http 默认会自动跟随重定向到目标网站)
    const res = await Widget.http.get(url, { headers: HEADERS });
    const html = res.data;

    console.log(`Detail page loaded, parsing content...: ${html}`);

    const $ = Widget.html.load(html);

    // 3. 获取基础信息 (尝试从 OpenGraph 标签或 Title 获取)
    let title = $('meta[property="og:title"]').attr('content') || $("title").text().trim();
    let coverUrl = $('meta[property="og:image"]').attr('content');

    console.log(`Parsed title: ${title}`);
    console.log(`Parsed cover URL: ${coverUrl}`);

    // 4. 通用视频地址嗅探 (逻辑参考 MISSAV)
    let videoUrl = "";

    // 1. 提取 sources 数组 (最关键的一步)
    // 正则含义：匹配 "var sources =" 后面直到 ";" 之前的所有内容
    const sourcesMatch = html.match(/var\s+sources\s*=\s*(\[.*?\]);/s);
    console.log(`Sources match: ${sourcesMatch}`);

    if (sourcesMatch && sourcesMatch[1]) {
      try {
        // 解析 JSON
        const sources = JSON.parse(sourcesMatch[1]);

        console.log(`Parsed sources: ${sources}`);

        // 2. 挑选最佳画质
        // 策略：优先找 desc 为 "720p" 或 "1080p" 的，找不到就拿第一个
        let bestSource = sources.find(s => s.desc === "1080p") ||
          sources.find(s => s.desc === "720p") ||
          sources[0];

        if (bestSource && bestSource.src) {
          videoUrl = bestSource.src;
        }
        console.log(`策略1: Selected video URL: ${videoUrl}`);
      } catch (e) {
        console.log("解析 sources JSON 失败: " + e.message);
      }
    }

    // 【策略 2】 直接 Video 标签模式 (新增：对应 gay4porn 等)
    // 说明：很多网站直接把地址写在 <video src="..."> 里
    if (!videoUrl) {
      // 优先找带 fp-engine 类的 (你提供的例子)，或者任意带 src 的 video 标签
      const $video = $('video.fp-engine').first();
      let src = $video.attr('src');

      // 如果没找到 fp-engine，尝试找任意有 src 的 video
      if (!src) {
        src = $('video[src]').attr('src');
      }

      if (src && src.startsWith('http')) {
        videoUrl = src;
      }
      console.log(`策略2: Selected video URL: ${videoUrl}`);
    }

    // 【策略 3】 通用正则暴力搜索 (兜底)
    // 应对那些既没有 video 标签，也没有明显 sources 变量的网站
    if (!videoUrl) {
      // 找 m3u8
      const m3u8Match = html.match(/https?:\/\/[^"'\s<>]+\.m3u8/i);
      if (m3u8Match) videoUrl = m3u8Match[0];

      // 找 mp4 (如果还没找到)
      if (!videoUrl) {
        const mp4Match = html.match(/https?:\/\/[^"'\s<>]+\.mp4/i);
        if (mp4Match) videoUrl = mp4Match[0];
      }
      console.log(`策略3: Selected video URL: ${videoUrl}`);
    }

    if (videoUrl) {
      let videoHeaders = {
        "Referer": BASE_URL, // 必须是根域名，不能是 link
        "User-Agent": HEADERS["User-Agent"]
      };

      if (videoUrl.includes("boyfriendtv.com")) {
        videoHeaders["Referer"] = "https://www.boyfriendtv.com/";
      } else if (videoUrl.includes("gaydudesfucking.com")) {
        videoHeaders["Referer"] = "https://www.gaydudesfucking.com/";
      } else if (videoUrl.includes("gay4porn.com")) {
        videoHeaders["Referer"] = "https://www.gay4porn.com/";
      }

      console.log(`Final video URL: ${videoUrl}`);

      return [{
        id: link,
        type: "video",
        title: title,
        videoUrl: videoUrl,
        playerType: "system",
        customHeaders: videoHeaders
      }];
    } else {
      return [{ id: "err", type: "text", title: "解析失败", subTitle: "未找到播放地址" }];
    }

  } catch (e) {
    return [{ id: "err", type: "text", title: "加载详情失败", subTitle: e.message }];
  }
}