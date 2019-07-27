import { IEntity } from './generic';

export type Snowflake = string & { readonly ['PhantomType:Snowflake']: never };
export type Color = number & { readonly ['PhantomType:Color']: never };
export type Permissions = number & { readonly ['PhantomType:Permissions']: never };

const snowflakeMaxValue = BigInt('0x' + 'F'.repeat(16));
const snowflakeMinValue = BigInt('0x' + '0'.repeat(16));
const colorMaxValue = Number('0x' + 'F'.repeat(6));
const colorMinValue = Number('0x' + 'F'.repeat(6));
const permissionMaxValue = Number('0b' + '1'.repeat(53));
const permissionMinValue = Number('0b' + '0'.repeat(53));

interface ISnowflakeGuard {
    from(value: string | Snowflake | IEntity): Snowflake;
    check(value: string): value is Snowflake;
    check(value: any): value is Snowflake;
}

export const Snowflake: ISnowflakeGuard = {
    from(source: string | IEntity | Snowflake): Snowflake {
        if (typeof source === 'object') { return (source as IEntity).id; }
        if (Snowflake.check(source)) {
            return source;
        }
        throw new Error('Invalid snowflake ' + source);
    },
    check(source: any): source is Snowflake {
        if (typeof source !== 'string') { return false; }
        if (!/^\d+$/.test(source)) { return false; }
        const s = BigInt(source);
        return snowflakeMinValue <= s && s <= snowflakeMaxValue;
    }
};

interface IColorGuard {
    from(value: number): Color;
    check(value: number): value is Color;
}

export const Color: IColorGuard = {
    from(source: number): Color {
        if (Color.check(source)) {
            return source;
        }
        throw new Error('Invalid color ' + source);
    },
    check(source: number): source is Color {
        return colorMinValue <= source && source <= colorMaxValue;
    }
};

interface IPermissionsGuard {
    from(value: number): Permissions;
    check(value: number): value is Permissions;
}

export const Permissions: IPermissionsGuard = {
    from(source: number): Permissions {
        if (Permissions.check(source)) {
            return source;
        }
        throw new Error('Invalid permissions ' + source);
    },
    check(source: number): source is Permissions {
        return permissionMinValue <= source && source <= permissionMaxValue;
    }
};