import { errorHandle } from "../../utils/resHandler";
import { redisClient } from "../config/redis.connections";

export const keyPrefixGenrator = async ({ purpose, userId }) => {
  return `user:${purpose}:${userId}`;
};
export const keyGenrator = async ({ jti, userId }) => {
  return `:${keyPrefixGenrator({ purpose: "revokeToken", userId })}:${jti}`;
};

export const setValue = async ({ key, value, ttl }) => {
  try {
    const data = typeof value != "string " ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { value: ttl, type: "EX" },
      });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    throw errorHandle({ message: "redis set Error", data: error });
  }
};
export const getValue = async ({ key }) => {
  try {
    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    throw errorHandle({ message: "redis set Error", data: error });
  }
};
export const updateValue = async ({ key, newValue, ttl }) => {
  try {
    const exist = await redisClient.exists(key);
    if (!exist) {
      return false;
    }
    return await setValue({ key, value: newValue, ttl });
  } catch (error) {
    throw errorHandle({ message: "redis update Error", data: error });
  }
};
export const deleteValue = async ({ key }) => {
  try {
    const data = await redisClient.del(key);
    return data;
  } catch (error) {
    throw errorHandle({ message: "redis delete Error", data: error });
  }
};

export const expire = async ({ key, ttl }) => {
  try {
    const data = await redisClient.expire(key, ttl);
    return data;
  } catch (error) {
    throw errorHandle({ message: "redis expire Error", data: error });
  }
};

export const TTL = async ({ key }) => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    throw errorHandle({ message: "redis expire Error", data: error });
  }
};
export const GetByPrefix = async ({ pattern }) => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    throw errorHandle({ message: "redis expire Error", data: error });
  }
};
