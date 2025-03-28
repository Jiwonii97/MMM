const db = require('mysql2');
require('dotenv').config();

const table = process.env.TABLE;
const pool = db.createPool({
	host: process.env.DB_HOST,
	user: process.env.USER_NAME,
	password: process.env.DB_KEY,
	database: process.env.DB_NAME,
	connectionLimit: 10
}).promise();

const api = {
	login: async (id, pw)=>{
		const [res] = await pool.query(`select cid from ${process.env.login_info} where id='${id}' and password='${pw}'`)
		return res;
	},
	search_shorts: async (content, reqNum)=>{
		let [res] = await pool.query(`select distinct title, thumnail, vid as shortId, chid as channelId, hits as numOfViews, numOfHearts, numOfSubscribers from mmmservice.video
		join (select chid, count(*) as numOfSubscribers from mmmservice.subscribe group by chid)a using(chid) natural left outer join (select vid, count(*) as numOfHearts from recommend group by vid)b where title like '%${content}%' limit ${reqNum*6}, 6`);
		return res;
	},
	search_channel: async (content,cid,reqNum)=>{
		const [res] = await pool.query(`select distinct ch_name as title, ch_profile as profile, chid as channelId, numOfSubscribers, introduce, isSubscribed, numOfShorts
		from mmmservice.channel left outer join (select chid, count(*) as numOfSubscribers from mmmservice.subscribe group by chid)a using (chid)
        join (select chid, count(sub) - 1 as isSubscribed from (select distinct chid, case when cid = ${cid} then 1 else 0 end as sub from mmmservice.subscribe)b group by chid)c using (chid)
		left outer join (select chid, count(*) as numOfShorts from video group by chid) as shortsCount using (chid)
		where ch_name like '%${content}%' limit ${reqNum*6}, 6;`);
		return res;
	},
	search_product: async (content,reqNum,order)=>{
		const [res] = await pool.query(`select access, p_name as title, thumnail, pid as productId, rate, price from mmmservice.product left outer join (select pid, round(avg(rate),1) as rate from review group by pid)a using (pid) where p_name like '%${content}%' order by ${order} limit ${reqNum*6}, 6`);
		return res;
	},
	recommend_tag: async ()=>{
		const [res] = await pool.query(`select tag from (select tag, count(*) as count from mmmservice.tag group by tag)a order by count desc limit 5`)
		return res.map(el=>el.tag);
	},
	recommend_shorts: async (reqNum)=>{
		const [res] = await pool.query(`select distinct title, thumnail, vid as shortId, chid as channelId, hits as numOfViews, numOfHearts, numOfSubscribers, profile from video join (select chid, count(*) as numOfSubscribers from subscribe group by chid)a using(chid) left outer join (select vid, count(*) as numOfHearts from recommend group by vid)b using (vid) left outer join (select chid, ch_profile as profile from channel )c using (chid) order by numOfSubscribers desc limit ${reqNum*6}, 6`)
		return res;
	},
	recommend_channel: async (cid)=>{
		const [res] = await pool.query(`select distinct ch_name as title, ch_profile as profile, chid as channelId, numOfSubscribers, introduce, isSubscribed
		from mmmservice.channel left outer join (select chid, count(*) as numOfSubscribers from mmmservice.subscribe group by chid)a using (chid)
        join (select chid, count(sub) - 1 as isSubscribed from (select distinct chid, case when cid = ${cid} then 1 else 0 end as sub from mmmservice.subscribe)b group by chid)c using (chid)
        order by numOfSubscribers desc limit 5;`)
		return res;
	},
	get_purchare_list: async (cid, reqNum) => {
		const [res] = await pool.query(`select distinct pid, p_date as date, price, p_num as purchaseNum, thumnail, p_name as productName\
		from product natural join purchase where cid = ${cid} limit ${reqNum*6}, 6`)
		return res;
	},

	get_short_info: async (vid, cid) =>{
		const [res] = await pool.query(`select distinct  title, vid as shortId, v_comment as info, numOfHearts, hits as numOfViews, url, numOfShorts, case when cid = ${cid} then true else false end as isMyShort from video natural left outer join (select vid, count(*) as numOfHearts from recommend group by vid) as recommendCounts natural join channel left outer join (select chid, count(*) as numOfShorts from video group by chid) as shortsCount using (chid) where vid = ${vid}`)
		return res;
	},
	get_channel_info: async (chid, cid)=>{
		const [res] = await pool.query(`select distinct ch_name as title, ch_profile as profile, chid as channelId, introduce, numOfSubscribers, numOfShorts,
		case when cid = ${cid} then true else false end as isMyChannel,
		case when ${cid} not in(select cid from subscribe where chid = ${chid}) then false else true end as isSubscribed
		from channel left outer join (select chid, count(*) as numOfSubscribers from subscribe group by chid) as subscribeCount using (chid)
		left outer join (select chid, count(*) as numOfShorts from video group by chid) as shortsCount using (chid) where chid = ${chid}`);
		return res;
	},
	get_tag: async (vid)=>{
		const [res] = await pool.query(`select tag from mmmservice.tag where vid = ${vid}`);
		return res.map(el=>el.tag);
	},
	get_comments: async (vid, reqNum) => {
        const [res] = await pool.query(`select distinct cu.c_name as name, ch.ch_profile as profile, re.r_comment as content, r_date as date from customer as cu natural join(channel as ch natural join reply as re) where re.vid = ${vid} order by r_date desc limit ${reqNum*6},6`)
        return res;
	},
	get_related_product: async (vid) => {
			const [res] = await pool.query(`select distinct p_name as title, thumnail as img, pid as productId from tag natural join product where tag.vid = ${vid};`)
			return res;
	},
	get_dressing_talbe: async (chid) => {
		const [res] = await pool.query(`select distinct category, p_name as title, thumnail as img, pid as productId from customer natural join (dressing_table natural join product) where chid = ${chid}`)
		return res;
	},
	get_product_info: async (pid) => {
		const [res] = await pool.query(`select pid as productId, p_name as title, company as manufacturer, avg_rate as rate, price, access as views, detail as productExplainHtml from product left outer join (select pid, round(avg(rate),1) as avg_rate from review group by pid)a using (pid) where pid = ${pid};`)
		return res;
	},
	get_product_img_info : async (pid) => {
		const [res] = await pool.query(`select img as productImages from product_img where pid = ${pid}`)
		return res.map(el=>el.productImages);
	},
	get_related_short_info : async (pid, reqNum) => {
		const [res] = await pool.query(`select title, thumnail, vid as shortId, chid as channelId, numOfSubscribers, numOfHearts, hits as numOfViews from channel natural join (video natural join tag)
		left outer join (select chid, count(*) as numOfSubscribers from subscribe group by chid)a using (chid) left outer join (select vid, count(*) as numOfHearts from recommend group by vid)b using (vid) where tag.pid = ${pid}
		limit ${reqNum*6}, 6`)
		return res;
	},
	get_product_review: async (pid,reqNum, isdesc) => {
		const [res] = await pool.query(`select ch_profile as profile, c_name as name, comment as content,rate, photo
		from channel join customer using(cid) join review using(cid) join product using(pid) where pid = ${pid} order by rate ${isdesc?'desc':''} limit ${reqNum*6}, 6`)
		return res;
	},
	like_up: async (cid, vid) => {
				console.log(vid)
        const [res] = await pool.query(`insert into recommend (cid, vid) values(${cid}, ${vid})`)
        return res;
    },
	like_down: async (cid, vid) => {
			const [res] = await pool.query(`delete from recommend where cid = ${cid} and vid = ${vid}`)
			return res;
	},

	get_my_shorts: async (chid, reqNum) =>{
		const [res] = await pool.query(`select distinct title, vid as shortId, v_comment as info, numOfHearts, hits as numOfViews , thumnail, chid as channelId \
		from mmmservice.video left join (select vid, count(*) as numOfHearts from recommend group by vid)b using(vid) where chid = ${chid} limit ${reqNum*6}, 6;`)
		return res;
	},
	is_purchase: async (pid, cid) =>{
		const [res] = await pool.query(`select * from purchase where pid = ${pid} and cid = ${cid} `)
		return res;
	},
	get_user_info: async (cid) =>{
		const [res] = await pool.query(`select c_name as name, id as ID, chid as channelId, birth, channel.ch_profile as profileImage, case when ${cid} is not null then true else false end as isLogined from customer natural join channel`)
		return res;
	},
	get_subscribe_list: async (cid) =>{
		const [res] = await pool.query(`select distinct ch_name as title, ch_profile as profile, chid as channelId, introduce, numOfSubscribers, numOfShorts, case when cid = ${cid} then true else false end as isMyChannel, case when ${cid} not in(select cid from subscribe where chid in (select chid from subscribe where cid = ${cid})) then false else true end as isSubscribed from channel left outer join (select chid, count(*) as numOfSubscribers from subscribe group by chid) as subscribeCount using (chid) left outer join (select chid, count(*) as numOfShorts from video group by chid) as shortsCount using (chid) where chid in (select chid from subscribe where cid = ${cid})`)
		return res;
	},
	add_view_video: (vid)=>{
		pool.query(`update video set hits = hits + 1 where vid = ${vid}`)
	},
	add_view_product: (pid)=>{
		pool.query(`update product set access = access + 1 where pid = ${pid}`)
	},
	get_chid: async (vid)=>{
		return await pool.query(`select chid from video where vid = ${vid}`)
	},
	get_AI_relation_short: async (face, tone, reqNum)=>{
		let [res] = await pool.query(`select distinct title, thumnail, vid as shortId, chid as channelId, hits as numOfViews, numOfHearts, numOfSubscribers
		from mmmservice.video
		join (select chid, count(*) as numOfSubscribers from mmmservice.subscribe group by chid)a using(chid)
		natural left outer join (select vid, count(*) as numOfHearts from recommend group by vid)b

		limit ${reqNum*6}, 6`);
		return res;
	},
	get_sub_video: async (cid, reqNum)=>{
		const [list] = await pool.query(`select distinct title, thumnail, vid as shortId, chid as channelId, hits as numOfViews, numOfHearts, numOfSubscribers, profile
		from video join (select chid, count(*) as numOfSubscribers from subscribe group by chid)a using(chid)
		left outer join (select vid, count(*) as numOfHearts from recommend group by vid)b using (vid)
		left outer join (select chid, ch_profile as profile from channel )c using (chid)
		where chid in (select chid from subscribe where cid = ${cid})
		order by numOfSubscribers desc limit ${reqNum*6}, 6`);
		const res={
			isMyChannel : false,
			title : "",
			isSubscribed : false,
			profile : "",
			channelId : 0,
			numOfSubscribers : 0,
			numOfShorts : 0,
			introduce : "",
			haveItem : false,
			dressingTable : [],
			shortList: list
		}
		return res;
	}

}

module.exports = new Proxy(api,{
	get: (target, apiName, receiver)=>{
		if(apiName == 'login'){ // 로그인 신청시
			return async function(id, pw){
				if(id && pw)// 아이디 비밀번호 입력 확인
					return await target.login(id, pw);
				else
					return null;
			}
		}
		else if(apiName == 'search'){
			return async function(type, content, cid, reqNum,order) {
				if(!content)
					return null;

				let ret = {
					'type': type
				}
				if(type == 'product'){
					if(order == 'rate')
						order = order + ' desc';
					else if(order == 'access')
						order = order + ' desc';
					else if(order == 'price_desc')
						order = 'price desc'
					else if(order == undefined)
						return null
					ret.searchResult = await target.search_product(content,reqNum,order);
				}
				else if(type == 'channel'){
					// const result = await target.search_channel(content, cid, reqNum);
					ret.searchResult = await target.search_channel(content, cid, reqNum);
					ret.searchResult.map(element => element.isSubscribed?true:false)
				}
				else if(type == 'short')
					ret.searchResult = await target.search_shorts(content, reqNum);
				return ret;
			}
		}
		else if(apiName == 'recommend'){
			return async function(type, cid, reqNum) {
				if(type == 'tag')
					return await target.recommend_tag();
				else if(type == 'channel'){
					const result = await target.recommend_channel(cid);
					result.map(element => element.isSubscribed?true:false)
					return result
				}
				else if(type == 'short')
					return await target.recommend_shorts(reqNum);
			}
		}
		else if(apiName == 'short_info'){
			return async function(vid, cid) {
				let [res] = await target.get_short_info(vid, cid);
				const [[chid]] = await target.get_chid(vid);
				[res.relatedChannel] = await target.get_channel_info(chid.chid, cid)
				res.relatedChannel.isMyChannel = res.relatedChannel.isMyChannel? true:false;
				res.relatedTags = await target.get_tag(vid);
				res.relatedProducts = await target.get_related_product(vid);
				res.comments = await target.get_comments(vid,0)
				if(res.relatedChannel)
					if( res.relatedChannel.isSubscribed)
						res.relatedChannel.isSubscribed = true;
					else
						res.relatedChannel.isSubscribed = false
				return res;
			}
		}
		else if(apiName == 'add_request'){
			return async function(type, id, reqNum, isdesc) {
				if(type == 'short')
					return await target.get_comments(id,reqNum);
				else if(type == 'channel'){
					return result = await target.get_my_shorts(id,reqNum);
				}
				else if(type == 'product')
					return await target.get_product_review(id,reqNum, isdesc);
			}
		}
		else if(apiName =='channel_info') {
			return async function(chid, cid) {
				let [res] = await target.get_channel_info(chid, cid);
				res.isMyChannel = res.isMyChannel?true:false;
				res.dressingTable = await target.get_dressing_talbe(chid);
				res.shortList = await target.get_my_shorts(chid,0);
				return res;
			}
		}
		else if(apiName == 'product_info') {
			return async function(pid) {
				let [res] = await target.get_product_info(pid);
					res.productImages = await target.get_product_img_info(pid);
					res.relatedShorts = await target.get_related_short_info(pid,0);
					res.reviews = await target.get_product_review(pid,0,true);
				return res;
			}
		}
		else if(apiName == 'user_info') {
			return async function(cid) {
				let [res] = await target.get_user_info(cid);
				res.subscribeChannelList = await target.get_subscribe_list(cid);

				return res;
			}
		}
		else
			return target[apiName];
	}
})


// module.exports.account = async () =>{
// 	let [a] = await pool.query(`select * from ${table}`);
// 	console.log(a);
// 	return a;
// }
