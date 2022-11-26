import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { 
    AuthToken,
    AuthRequest 
} from "../middlewares/authentication-middleware";

import { Song } from "../models/song-model";

import * as fs from 'fs';
import * as path from 'path';
import { getMP3Duration } from "../utils/get-mp3-duration";

interface UpdateRequest {
    title: string;
}

export class SongController {
    store() {
        return async (req: Request, res: Response) => {
            const { token } = req as AuthRequest;
            if (!token || token.isAdmin) {
                // Endpoint hanya bisa diakses oleh penyanyi
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }

            // Parse request body
            const { title } = req.body;

            // Buat song baru
            const song = new Song();
            song.judul = title;
            song.penyanyiID = token.userID;
            song.audioPath = req.file!.filename;

            // Buat lagu
            const newSong = await song.save();
            if (!newSong) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: ReasonPhrases.BAD_REQUEST,
                });
                return;
            }

            res.status(StatusCodes.CREATED).json({
                message: ReasonPhrases.CREATED,
            })
        };
    }

    index() {
        return async (req: Request, res: Response) => {
            const { token } = req as AuthRequest;
            if (!token || token.isAdmin) {
                // Endpoint hanya bisa diakses oleh penyanyi
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }

            // Fetch semua lagu milik requester
            const songs = await Song.findBy({
                penyanyiID: token.userID
            });

            // Construct expected data
            interface ISongData {
                id: number;
                title: string;
                duration: Number;
            }

            let songsData: ISongData[] = [];

            songs.forEach(song => {
                const buffer = fs.readFileSync(path.join(__dirname, "..", "..", "uploads", song.audioPath))
                const duration = getMP3Duration(buffer)
                
                songsData.push({
                    id: song.songID,
                    title: song.judul,
                    duration: Math.ceil(duration / 1000)
                });
            })

            res.status(StatusCodes.OK).json({
                message: ReasonPhrases.OK,
                data: songsData
            });
        };
    }

    show() {
        return async (req: Request, res: Response) => {
            const { token } = req as AuthRequest;
            if (!token || token.isAdmin) {
                // Endpoint hanya bisa diakses oleh penyanyi
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }

            const songID = parseInt(req.params.id);

            // Fetch semua lagu milik requester
            const song = await Song.findOneBy({
                songID
            });

            // Apabila tidak ditemukan ...
            if (!song) {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: ReasonPhrases.NOT_FOUND,
                });
                return;
            }

            // Bukan lagu requester ...
            if (song.penyanyiID != token.userID) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }

            res.status(StatusCodes.OK).json({
                messeage: ReasonPhrases.OK,
                data: song
            });
        };
    }

    update() {
        return async (req: Request, res: Response) => {
            const { token } = req as AuthRequest;
            if (!token || token.isAdmin) {
                // Endpoint hanya bisa diakses oleh penyanyi
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }

            // Parse request body
            const { title } : UpdateRequest = req.body;

            // Parse request param
            const songID = parseInt(req.params.id);

            const song = await Song.findOneBy({
                songID
            });

            // Apabila tidak ditemukan ...
            if (!song) {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: ReasonPhrases.NOT_FOUND,
                });
                return;
            }

            // Bukan lagu requester ...
            if (song.penyanyiID != token.userID) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }
            
            // Update model
            song.judul = title;

            // Save!
            const newSong = await song.save();
            if (!newSong) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: ReasonPhrases.BAD_REQUEST,
                });
                return;
            }

            res.status(StatusCodes.OK).json({
                message: ReasonPhrases.OK
            });
        };
    }

    updateTitle() {
        return async (req: Request, res: Response) => {
            const { token } = req as AuthRequest;
            if (!token || token.isAdmin) {
                // Endpoint hanya bisa diakses oleh penyanyi
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }

            // Parse request body
            const { title } : UpdateRequest = req.body;

            // Parse request param
            const songID = parseInt(req.params.id);

            const song = await Song.findOneBy({
                songID
            });

            // Apabila tidak ditemukan ...
            if (!song) {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: ReasonPhrases.NOT_FOUND,
                });
                return;
            }

            // Bukan lagu requester ...
            if (song.penyanyiID != token.userID) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }
            
            // Update model
            song.judul = title;

            // Save!
            const newSong = await song.save();
            if (!newSong) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: ReasonPhrases.BAD_REQUEST,
                });
                return;
            }

            res.status(StatusCodes.OK).json({
                message: ReasonPhrases.OK
            });
        };
    }

    delete() {
        return async (req: Request, res: Response) => {
            const { token } = req as AuthRequest;
            if (!token || token.isAdmin) {
                // Endpoint hanya bisa diakses oleh penyanyi
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }

            // Parse request param
            const songID = parseInt(req.params.id);

            const song = await Song.findOneBy({
                songID
            });

            // Apabila tidak ditemukan ...
            if (!song) {
                res.status(StatusCodes.NOT_FOUND).json({
                    message: ReasonPhrases.NOT_FOUND,
                });
                return;
            }
            if (song.penyanyiID != token.userID) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: ReasonPhrases.UNAUTHORIZED,
                });
                return;
            }
            
            // Delete!
            const newSong = await song.remove();
            if (!newSong) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: ReasonPhrases.BAD_REQUEST,
                });
                return;
            }

            // Delete from storage
            fs.unlinkSync(path.join(__dirname, "..", "..", "uploads", newSong.audioPath));

            res.status(StatusCodes.OK).json({
                message: ReasonPhrases.OK
            });
        };
    }
}
