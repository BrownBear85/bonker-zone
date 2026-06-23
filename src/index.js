/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import testimonialsData from './data/testimonials.json';
import linksData from './data/links.json';
import projectsData from './data/projects.json';

const formatter = new Intl.NumberFormat('en', { notation: 'compact'});

const projectsCacheLifespan = 30 * 1000;
var projectsCache = [];
var cacheTime = -1;

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		switch (url.pathname) {
			case '/api/testimonial': {
				const currentIndex = parseInt(url.searchParams.get('currentIndex')) ?? -1;

				let nextIndex;
				if (currentIndex == -1) {
					nextIndex = Math.floor(Math.random() * testimonialsData.length);
				} else {
					nextIndex = currentIndex == testimonialsData.length - 1 ? 0 : currentIndex + 1;
				}

				return Response.json({ ...testimonialsData[nextIndex], index: nextIndex });
			}
			case '/api/links': {
				return Response.json(linksData);
			}
			case '/api/projects': {
				if (projectsCache.length == 0 || cacheTime == -1 || Date.now() - cacheTime > projectsCacheLifespan) {
					cacheTime = Date.now();
					
					projectsCache = [];
					let downloadCounts = await getDownloadCounts(env);
					for (let i = 0; i < projectsData.length; i++) {
						projectsCache.push({ ...projectsData[i], downloads: downloadCounts[i] });
					}
				}

				return Response.json(projectsCache);
			}
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
};

async function getDownloadCounts(env) {
	try {
		const curseforgeIds = projectsData.map(project => project.curseforge).filter(project => project != null);
		const modrinthIds = projectsData.map(project => project.modrinth).filter(project => project != null);

		const curseforgeData = await fetch('https://api.curseforge.com/v1/mods', {
			method: 'POST',
			body: `{"modIds": ${JSON.stringify(curseforgeIds)}}`,
			headers: {
				'Content-Type':'application/json',
				'Accept':'application/json',
				'x-api-key':env.CURSEFORGE_API_KEY
			}
		})
		.then(response => response.json());

		const modrinthData = await fetch(`https://api.modrinth.com/v2/projects?ids=${JSON.stringify(modrinthIds)}`)
			.then(response => response.json());
		modrinthData.sort((a, b) => modrinthIds.indexOf(a.id) - modrinthIds.indexOf(b.id));

		let downloadCounts = [];
		for (const obj of projectsData) {
			let downloads = 0;
			
			let curseforgeIndex = curseforgeIds.indexOf(obj.curseforge);
			if (curseforgeIndex != -1) {
				downloads += curseforgeData.data[curseforgeIndex].downloadCount;
			}

			let modrinthIndex = modrinthIds.indexOf(obj.modrinth);
			if (modrinthIndex != -1) {
				downloads += modrinthData[modrinthIndex].downloads;
			}

			downloadCounts.push(formatter.format(downloads));
		}

		return downloadCounts;
	} catch (e) {
		console.error("An error occurred whilst requesting download counts:", e);
	}
}