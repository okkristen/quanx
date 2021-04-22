/*
支持boxjs手动修改位置，可直接输入中文地区名
更新时间 2021-03-02 10:26
*/
const $ = new Env('基金');
const notify = $.isNode() ? require('./sendNotify') : '';
let msgs = [];
let titleMsgs = [];

!(async () => {
	await bonds();
	await sendMsg();
	// await SearchCity();
	// await fortyReport();
	// await Weather();
	// await TodayReport();
	// await showmsg()
})()
.catch((e) => $.logErr(e))
	.finally(() => $.done())


function getURL() {
	// var URL  = 'http://57.push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f243&fs=b:MK0354&fields=f1,f152,f2,f3,f12,f13,f14,f227,f228,f229,f230,f231,f232,f233,f234,f235,f236,f237,f238,f239,f240,f241,f242,f26,f243&_=1615020528285'
	 var URL  = 'http://57.push2.eastmoney.com/api/qt/clist/get?'
	var URLARR = [];
	URLARR.push('pn=1')
	URLARR.push('pz=150')
	URLARR.push('po=1')
	URLARR.push('np=1')
	URLARR.push('ut=bd1d9ddb04089700cf9c27f6f7426281')
	URLARR.push('fltt=2')
	URLARR.push('invt=2')
	URLARR.push('fid=f243')
	URLARR.push('fs=b:MK0354')
	var fields = ['fields=f1'];
	for (var i = 1; i < 300; i++) {
		fields.push('f' + i);
	}
	URLARR.push(fields.join(','))
	// URLARR.push('fields=f1,f152,f2,f3,f12,f13,f14,f227,f228,f229,f230,f231,f232,f233,f234,f235,f236,f237,f238,f239,f240,f241,f242,f26,f243')
	URLARR.push('_=1615020528285')
	URL += URLARR.join('&')
	// console.log(URL)
	return URL;
}
/**
 * 可转债
 */
function bonds() {
	return new Promise((resolve, reject) => {
		let param = {
			url: getURL()
		}
		$.get(param, (error, response, data) => {
			try {
				$.bonds = JSON.parse(data);
				fomart($.bonds.data.diff)
			} catch (e) {
				$.logErr(e, resp);
			} finally {
				resolve()
			}
		})
	})
}

/**
 * @param {Object} bond 转债列表
 * 沪市可转债开头代码：110/113。
 * 深市可转债开头代码：主板为127、中小板为128、创业板为123。
 */
function fomart (bonds) {
	var bondTitles = []
	suffix = {'110': 'SH', '113': 'SH', '127': 'SZ', '128': 'SZ' , '123': 'SZ'}
	// bondTitles.push({title: '序号', value: ''})
	bondTitles.push({title: '转债代码', value: 'f12'})
	bondTitles.push({title: '转债名称', value: 'f14'})
	bondTitles.push({title: '最新价', value: 'f2'})
	// bondTitles.push({title: '涨跌幅', value: 'f3'})
	// bondTitles.push({title: '相关链接', value: ''})
	// bondTitles.push({title: '正股代码', value: 'f232'})
	// bondTitles.push({title: '正股名称', value: 'f234'})
	// bondTitles.push({title: '最新价', value: 'f229'})
	// bondTitles.push({title: '涨跌幅', value: 'f230'})
	// bondTitles.push({title: '转股价', value: 'f235'})
	// bondTitles.push({title: '转股价值', value: 'f236'})
	// bondTitles.push({title: '转股溢价率', value: 'f237'})
	// bondTitles.push({title: '纯债溢价率', value: 'f238'})
	// bondTitles.push({title: '回售触发价', value: 'f239'})
	// bondTitles.push({title: '强赎触发价', value: 'f240'})
	// bondTitles.push({title: '到期赎回价', value: 'f241'})
	// bondTitles.push({title: '纯债价值', value: 'f227'})
	// bondTitles.push({title: '开始转股日', value: 'f242'})
	bondTitles.push({title: '上市日期', value: 'f26'})
	bondTitles.push({title: '申购日期', value: 'f243'})
	var titles = []
	for (var i = 0; i < bondTitles.length; i++) {
		var bondTitle  = bondTitles[i]
		titles.push(bondTitle.title)
	}
	var  today = ['今日可申购可转债'];
	console.log(titles.join('||'))
	//  上市日期或者 申购日期 大于现在时间
	var now = dateFormat("YYYYmmdd", new Date())
	var balance = []
	for (var i = 0; i < bonds.length; i++) {
		var bond  = bonds[i];
		// 差额
		if (Number(bond['f241']) && Number(bond['f2'])) {
			bond.balance = (Number(bond['f241']) - Number(bond['f2'])).toFixed(2)
			bond.suffix = suffix[bond['f12'].substring(0,3)]
			balance.push(bond);
		}
		if(bond['f243'] == now) {
			today.push(bond['f14'])
			continue;
		}
		if(bond['f243'] < now  &&  bond['f26'] < now) {
			continue;
		}
		
		var data = []
		for (var j = 0; j < bondTitles.length; j++) {
			var bondTitle  = bondTitles[j]
			data.push(bond[bondTitle.value])
		}
	}
	balance.sort(function (a,b) {
		return b.balance - a.balance
	})
	var balanceMsg  = []
	// var length = balance.length > 10 ? 10 : balance.length
	 var length = balance.length
	for (var i = 0; i < length; i++) {
		if(balanceMsg.length <= 10)
		 balanceMsg.push(balance[i]['f14'] +'/' + balance[i]['f12'] + '/' + balance[i]['suffix'] +'/' + balance[i]['balance'])
	}
	titleMsgs.push(today.join('-'))
	msgs.push(balanceMsg.join('--'))
	msgs.push(titles.join('||'))
	msgs.push(data.join('||'))
	console.log(data.join('||'))
}

function sendMsg() {
	let msg = ""
	for (var i = 0; i < msgs.length; i++) {
		msg += msgs[i] + "\n "
	}
	$.msg('可转债转债',titleMsgs.join(''), msg)
}


function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
} 


function Env(t, e) {
	class s {
		constructor(t) {
			this.env = t
		}
		send(t, e = "GET") {
			t = "string" == typeof t ? {
				url: t
			} : t;
			let s = this.get;
			return "POST" === e && (s = this.post), new Promise((e, i) => {
				s.call(this, t, (t, s, r) => {
					t ? i(t) : e(s)
				})
			})
		}
		get(t) {
			return this.send.call(this.env, t)
		}
		post(t) {
			return this.send.call(this.env, t, "POST")
		}
	}
	return new class {
		constructor(t, e) {
			this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !
				1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this,
					e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`)
		}
		isNode() {
			return "undefined" != typeof module && !!module.exports
		}
		isQuanX() {
			return "undefined" != typeof $task
		}
		isSurge() {
			return "undefined" != typeof $httpClient && "undefined" == typeof $loon
		}
		isLoon() {
			return "undefined" != typeof $loon
		}
		toObj(t, e = null) {
			try {
				return JSON.parse(t)
			} catch {
				return e
			}
		}
		toStr(t, e = null) {
			try {
				return JSON.stringify(t)
			} catch {
				return e
			}
		}
		getjson(t, e) {
			let s = e;
			const i = this.getdata(t);
			if (i) try {
				s = JSON.parse(this.getdata(t))
			} catch {}
			return s
		}
		setjson(t, e) {
			try {
				return this.setdata(JSON.stringify(t), e)
			} catch {
				return !1
			}
		}
		getScript(t) {
			return new Promise(e => {
				this.get({
					url: t
				}, (t, s, i) => e(i))
			})
		}
		runScript(t, e) {
			return new Promise(s => {
				let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
				i = i ? i.replace(/\n/g, "").trim() : i;
				let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
				r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
				const [o, h] = i.split("@"), a = {
					url: `http://${h}/v1/scripting/evaluate`,
					body: {
						script_text: t,
						mock_type: "cron",
						timeout: r
					},
					headers: {
						"X-Key": o,
						Accept: "*/*"
					}
				};
				this.post(a, (t, e, i) => s(i))
			}).catch(t => this.logErr(t))
		}
		loaddata() {
			if (!this.isNode()) return {}; {
				this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
				const t = this.path.resolve(this.dataFile),
					e = this.path.resolve(process.cwd(), this.dataFile),
					s = this.fs.existsSync(t),
					i = !s && this.fs.existsSync(e);
				if (!s && !i) return {}; {
					const i = s ? t : e;
					try {
						return JSON.parse(this.fs.readFileSync(i))
					} catch (t) {
						return {}
					}
				}
			}
		}
		writedata() {
			if (this.isNode()) {
				this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
				const t = this.path.resolve(this.dataFile),
					e = this.path.resolve(process.cwd(), this.dataFile),
					s = this.fs.existsSync(t),
					i = !s && this.fs.existsSync(e),
					r = JSON.stringify(this.data);
				s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
			}
		}
		lodash_get(t, e, s) {
			const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
			let r = t;
			for (const t of i)
				if (r = Object(r)[t], void 0 === r) return s;
			return r
		}
		lodash_set(t, e, s) {
			return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce(
				(t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length -
				1]] = s, t)
		}
		getdata(t) {
			let e = this.getval(t);
			if (/^@/.test(t)) {
				const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
				if (r) try {
					const t = JSON.parse(r);
					e = t ? this.lodash_get(t, i, "") : e
				} catch (t) {
					e = ""
				}
			}
			return e
		}
		setdata(t, e) {
			let s = !1;
			if (/^@/.test(e)) {
				const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}";
				try {
					const e = JSON.parse(h);
					this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
				} catch (e) {
					const o = {};
					this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
				}
			} else s = this.setval(t, e);
			return s
		}
		getval(t) {
			return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ?
				(this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
		}
		setval(t, e) {
			return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t,
				e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[
				e] || null
		}
		initGotEnv(t) {
			this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require(
				"tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ?
				t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
		}
		get(t, e = (() => {})) {
			t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ?
				(this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
					"X-Surge-Skip-Scripting": !1
				})), $httpClient.get(t, (t, s, i) => {
					!t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
				})) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
					hints: !1
				})), $task.fetch(t).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
					try {
						if (t.headers["set-cookie"]) {
							const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
							this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
						}
					} catch (t) {
						this.logErr(t)
					}
				}).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => {
					const {
						message: s,
						response: i
					} = t;
					e(s, i, i && i.body)
				}))
		}
		post(t, e = (() => {})) {
			if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] =
					"application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon())
				this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
					"X-Surge-Skip-Scripting": !1
				})), $httpClient.post(t, (t, s, i) => {
					!t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
				});
			else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
				hints: !1
			})), $task.fetch(t).then(t => {
				const {
					statusCode: s,
					statusCode: i,
					headers: r,
					body: o
				} = t;
				e(null, {
					status: s,
					statusCode: i,
					headers: r,
					body: o
				}, o)
			}, t => e(t));
			else if (this.isNode()) {
				this.initGotEnv(t);
				const {
					url: s,
					...i
				} = t;
				this.got.post(s, i).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => {
					const {
						message: s,
						response: i
					} = t;
					e(s, i, i && i.body)
				})
			}
		}
		time(t) {
			let e = {
				"M+": (new Date).getMonth() + 1,
				"d+": (new Date).getDate(),
				"H+": (new Date).getHours(),
				"m+": (new Date).getMinutes(),
				"s+": (new Date).getSeconds(),
				"q+": Math.floor(((new Date).getMonth() + 3) / 3),
				S: (new Date).getMilliseconds()
			};
			/(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length)));
			for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : (
				"00" + e[s]).substr(("" + e[s]).length)));
			return t
		}
		msg(e = t, s = "", i = "", r) {
			const o = t => {
				if (!t) return t;
				if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {
					"open-url": t
				} : this.isSurge() ? {
					url: t
				} : void 0;
				if ("object" == typeof t) {
					if (this.isLoon()) {
						let e = t.openUrl || t.url || t["open-url"],
							s = t.mediaUrl || t["media-url"];
						return {
							openUrl: e,
							mediaUrl: s
						}
					}
					if (this.isQuanX()) {
						let e = t["open-url"] || t.url || t.openUrl,
							s = t["media-url"] || t.mediaUrl;
						return {
							"open-url": e,
							"media-url": s
						}
					}
					if (this.isSurge()) {
						let e = t.url || t.openUrl || t["open-url"];
						return {
							url: e
						}
					}
				}
			};
			this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e,
				s, i, o(r)));
			let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];
			h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h)
		}
		log(...t) {
			t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
		}
		logErr(t, e) {
			const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
			s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("",
				`\u2757\ufe0f${this.name}, \u9519\u8bef!`, t)
		}
		wait(t) {
			return new Promise(e => setTimeout(e, t))
		}
		done(t = {}) {
			const e = (new Date).getTime(),
				s = (e - this.startTime) / 1e3;
			this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() ||
				this.isQuanX() || this.isLoon()) && $done(t)
		}
	}(t, e)
}
