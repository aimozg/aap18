/*
 * Created by aimozg on 29.11.2022.
 */

import "reflect-metadata";
import {assertInt} from "./assertions";

export function PropertyValidator<T>(initialValue:T, validator:(value:T, propertyName:string)=>T): PropertyDecorator {
	return function(prototype:Object, propertyName:string) {
		initialValue = validator(initialValue, propertyName);
		const propertySymbol = Symbol(propertyName);
		Object.defineProperty(prototype, propertyName, {
			get(this:any): T {
				return (this[propertySymbol] ??= initialValue)
			},
			set(this:any, v: T) {
				v = validator(v,propertyName);
				this[propertySymbol] = v;
			}
		})
	}
}

export function IntProperty(initialValue:number){
	return PropertyValidator(initialValue,assertInt);
}

const ParamValidatorsKey = Symbol("ParamValidators")
type ParamValidator = (args:IArguments)=>void;

export function AddParamValidator<T>(target:Object, methodName:string, paramIndex:number, validator:(value:T, propertyName:string)=>T) {
	const propertyName = methodName+" arg #"+paramIndex+"";
	const validators:ParamValidator[] = Reflect.getOwnMetadata(ParamValidatorsKey, target, methodName) ?? [];
	validators.push(args=>{
		args[paramIndex] = validator(args[paramIndex], propertyName);
	});
	Reflect.defineMetadata(ParamValidatorsKey, validators, target, methodName)
}

export function IntParam(target: Object, methodName:string, paramIndex:number) {
	AddParamValidator(target, methodName, paramIndex, assertInt)
}

export function ValidateParams(target:Object, methodName:string, descriptor: TypedPropertyDescriptor<Function>) {
	const method = descriptor.value!;
	descriptor.value = function() {
		const validators: ParamValidator[]|undefined = Reflect.getOwnMetadata(ParamValidatorsKey, target, methodName);
		if (validators) {
			for (let validator of validators) validator(arguments);
		}
		return method.apply(this, arguments);
	}
}
