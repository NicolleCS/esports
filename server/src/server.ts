import express from 'express';
import { convertHourStringToMinutes  } from './utils/convert-hours-string-to-minutes';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { ConvertMinutesToHourString } from './utils/convert-minutes-to-hour-string';

const app = express();
app.use(express.json());

app.use(cors());

const prisma = new PrismaClient();

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true
                }
            }
        }
    });
    return response.json(games);
});

app.post('/games/:id/ads', async (request, response) => {
    const gameId: string = request.params.id;
    const body: any = request.body;

    const newAds = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
            createdAt: new Date(),
        }
    });
    
    return response.status(201).json(newAds);
});

app.post('/ads', (request, response) => {
    return response.status(201).json([]);
});

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: ConvertMinutesToHourString(ad.hourStart),
            hourEnd: ConvertMinutesToHourString(ad.hourEnd),
        }
    }));
});

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true
        },
        where: {
            id: adId
        }
    });

    return response.json({
        discord: ad.discord
    });
});

app.listen(3333);